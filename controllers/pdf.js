import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import fs from 'fs';



/* HELPER FUNCTIONS */

const getCurrentDisplayUnits = (requisition, product_id, is_display) => {
    const {orders} = requisition;
    
    const currentUnits = 
        orders
            .filter(order => order.is_display === is_display)
            .reduce((acc, curr) => {

            const ingredient_ids = curr.product.ingredients.map(ing => ing.product_id);

            if ( product_id === curr.product_id ) {
                return Number(acc) + Number(curr.units);
            } else if ( ingredient_ids.indexOf(product_id) > -1 ){
                // Calculate bottles from units
                const ingredient = curr.product.ingredients.find(ing => ing.product_id === product_id );
                const totalml = ingredient.quantity * curr.units;
                const totalUnits = Math.round(totalml / curr.product.metric_amount); 
                return acc + totalUnits;
            } else {
                return acc;
            }
        }, 
    0);

    if (currentUnits < 1) return '';

    if (is_display) {
        return `/ ${currentUnits} Display`;
    } else {
        return `${currentUnits} Consumable`;;
    }
}

const getCurrentUnits = (requisition, product_id) => {
    const {orders} = requisition;
    
    const currentUnits = orders.reduce((acc, curr) => {

        const ingredient_ids = curr.product.ingredients.map(ing => ing.product_id);

        if ( product_id === curr.product_id ) {
            return Number(acc) + Number(curr.units);
        } else if ( ingredient_ids.indexOf(product_id) > -1 ){
            // Calculate bottles from units
            const ingredient = curr.product.ingredients.find(ing => ing.product_id === product_id );
            const totalml = ingredient.quantity * curr.units;
            const totalUnits = Math.round(totalml / curr.product.metric_amount); 
            return acc + totalUnits;
        } else {
            return acc;
        }
    }, 0);

    return currentUnits;
}


const getUniqueProducts = (requisition) => {
    
    const {orders} = requisition;

    // Filter the products for the brand
    // Products for brands
    const products_ids = orders
        .filter(order => !order.product.is_cocktail)
        .map(order => order.product_id);

    const cocktail_products_id = [];
    orders
        .filter(order => order.product.is_cocktail)
        .map(order => {
            order.product.ingredients.map(ing => cocktail_products_id.push(ing.product_id));
        })
    
    const all_ids = [...products_ids, ...cocktail_products_id];
        
    // Unique products
    const unique_products = [...new Set(all_ids)];
    return unique_products;
}

// PDF 

const  generateHeader = async (doc, requisition) => {

    const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPgAAAAaCAMAAACtg2GwAAAAUVBMVEVHcEx6uodUZKhUZqh4t4ZVZqllk45SZ6dUZqdUZad6u4d6uoZUZql4uYV5uoZ7u4d7u4dVZalVZah6u4Z5uohVZqlVZql6u4dVZqhVZqlVZ6liaRYWAAAAF3RSTlMAm0OcIdwQIYBg33q/RWC/7+9wz7Cvr3/crFMAAAS2SURBVFjDrZiJdqsgEEBFERQkbklt/f8PfezMAEl8Teec9iSOYu7s0DRvpB1y4frqWFwdwCPbo9cydW25HNs6o+sfI88U44aW6wgSKVW2kiJ3sRxiJrmCybvQMpMbRVeJEIfY78VCT6T7zsXgTMXV74g9/Wg57b9+zKw4eZX56wA6LxY8j1zEDWIsdUVDZ/DIrN7eryW68xNwbrGT9GBB1mHdT4wS3pfrHaXISCcym0TfqgVrCH19v5HTyPgZOO8ztvPcIneu+zk7r6pw18APVac7jsVraKHZmX6zeLbSX4EX3EbCkjWdI2+/L4LPT+g0ufOhqEYJKa6S33q8q4NHtv7rK8b86qJ9iN+naVrDlw2+o5+sQHAxWwmoDMWtUcbPRqW8FXQtvItE6J+epSR7uvkNOJQEznxw9qgmjJ5msuWcB9TJfgsmcaV+9DZazU94pIXTa9yP9XWIeUAK/Efsr6cEuFZC7yuCzeGi29y/oBSH4LYddS/AY3ROUN/nNcs71saIy+qexXqWbu7wUhXw5hbB6YE1QbWwYJMl1kBX2tKz/mpW1QH4ZD6+BG8GT76BZgXzFoaAvsKKIu+t0uuPm4ueV+DOlyJhyPQWEq/4T/sNhfItdDFaD+Q6OONJUERO3zhAg1N/YPRPAa7FhQ4kvb6duZUG9gycqZSxc9GQmMvhO6xis1QRnqYSTxS7Cj5WixvovTF4faSj4N8cHAOUyeXJFsO1qm5pl7IskxAOCveA4HjUBXZJw9iy/Qo8pvkjvH/NIz06mvto6JGl11QRhivgu/nFrOzDPg+OGA7JUhLq8VSjCfvfgccuFNI8K23Aq9zHPIoGHyHDk9eUvZeCuFWVJK6MaMfMmkojN6HzAXhI85MXHszA2yp4up9PVzwu1Fvw1N3wqJL7XLe5T8D5itK8L0N9xKG+ol1UGmGujqym1BVFHYa6b9/lcEqJyAa6d+B8TJKDhzT3sI8Szhf6WOXaMv/bmOEdeo132M2KFLFXCzC8enGZvUeLKjJXplMl5wUMv+/An/XxSppvRcvisdCXPT4YhQWHD6/6uJ/PU68GsU4r87eG9y6+o028t6Aecj4D97/5tPM4Q7M5YBtjQp9t3um0UXi2bg28iY1cHdm4HfZe1hSS5O3dxIbaaT7ufAru09yNohMez8L+2373jXwdMbcxigd/6XGW2rcAzc34ez/iVGecLxTOgLut9enwQV70eFvN8XQtBHuXslZHdMsYH1Z43hB341PLG755G9l3e/B1bI2EAdEXIWpFzSmc45RClFaQBRQ+5/zZzqYqm2SFHVzCUcz7HK9vSytVmKfQ9lBhP4ZqWbqe0mK9uh93AUBqGoI1qYzR0O0M/JIW+lPwpivPGuK+ZCh1J97wvAV3EzrbK1Mda/KJNRikdrto/hi8JAf7sW3NdGsbDqUugvvuzQqfuwGtkUvNVMU4ZzfkfwweTxhCfsPdUHYyNfHfHjY2N8SypFNIUjNIbihxZVb/X3CNHg+d+iHfBLZf0dvo1J0N/TvwBR+g3/a0A4VvgSNaPF1uqNzBpu3SuTrcjzsxr+GlQM+2m97ztby6ntENY6nL16OZFA9QJbWoZwqZbb2zq/8AoZBD+QiMLZcAAAAASUVORK5CYII='

    doc
      .image(image, 50, 65, { width: 150 })
      .fillColor("#444444")
      .fontSize(20)
      .fontSize(10)
      .text(`#${requisition.serial_number}`, 200, 65, { align: "right" })
      .text(`${requisition.client.name}`, 200, 80, { align: "right" })
      .moveDown();
  }



const generateFooter = (doc) => {
    doc
      .fontSize(10)
      .text(
        "Booze Boss requistion.",
        50,
        780,
        { align: "center", width: 500 }
      );
  }

function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

function generateSignature(doc, top) {

    let y = top + 60;

    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(200, y)
        .lineTo(400, y)
        .stroke()
        .font("Helvetica-Bold");

    doc
        .fontSize(10)
        .text("Received by", 265, y + 10)
        .font("Helvetica-Bold")
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(200, y + 50)
        .lineTo(400, y + 50)
        .stroke();

    doc
        .fontSize(10)
        .text("Date", 285, y + 60)
        .font("Helvetica-Bold")
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(200, y + 100)
        .lineTo(400, y + 100)
        .stroke();

    doc
        .fontSize(10)
        .text("Signature", 275, y + 110)
        .font("Helvetica-Bold")
}


function formatCurrency(cents) {
    return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return year + "/" + month + "/" + day;
}

function generateCustomerInformation(doc, requisition) {

    const customerInformationTop = 160;

    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Requisition", 50, customerInformationTop - 40);
  
    generateHr(doc, customerInformationTop - 15);
    
    doc
        .fontSize(10)
        .text("Requisition Serial:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text(`#${requisition.serial_number}`, 150, customerInformationTop)
        .font("Helvetica")
        .text("Creation Date:", 50, customerInformationTop + 15)
        .text(moment(requisition.created_at).format('DD/MM/YYYY LT'), 150, customerInformationTop + 15)
        .text("Requested by:", 50, customerInformationTop + 30)
        .text(
            requisition.brief.agency.name,
            150,
            customerInformationTop + 30
        )
    
        generateHr(doc, customerInformationTop + 52);
  }

const getEvent = async (doc, top, brief_event) => {

    doc
      .fillColor("#444444")
      .fontSize(14)
      .text(brief_event.name, 50, top - 40);  

    generateHr(doc, top - 15);
    
    doc
        // First row
        .fontSize(10)
        .font("Helvetica")
        .text("Setup Time:", 50, top)
        .font("Helvetica-Bold")
        .text(moment(brief_event.setup_time).format('DD/MM/YYYY LT'), 110, top)
        .font("Helvetica")
        .text("Start Time:", 220, top)
        .font("Helvetica-Bold")
        .text(moment(brief_event.start_time).format('DD/MM/YYYY LT'), 280, top)
        .font("Helvetica")
        
        // Second row
        .fontSize(10)
        .font("Helvetica")
        .text("Venue:", 50, top + 15)
        .font("Helvetica-Bold")
        .text(`${brief_event.venue.name} (${brief_event.venue.address})`, 110, top + 15)
        
        // Third row
        .fontSize(10)
        .font("Helvetica")
        .text("Guests:", 50, top + 30)
        .font("Helvetica-Bold")
        .text(brief_event.expected_guests, 110, top + 30)
        .font("Helvetica")

  
    generateHr(doc, top + 52);
}
  
const generateEvents = async (doc, requisition) => {
    let customerInformationTop = 280;

    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Events", 50, customerInformationTop - 40);  

    for (const brief_event of requisition.brief.brief_events) {
        await getEvent(doc, customerInformationTop + 40, brief_event)
        customerInformationTop = customerInformationTop + 110;
    }
    
    return customerInformationTop;
}

const generateProductHeader = async (doc, top) => {
    
    const new_top = top + 10;
    
    doc
        .font("Helvetica")
        .fillColor("#444444")
        .fontSize(20)
        .text("Required Products", 50, new_top);
        
    return new_top;

}

function generateTableRow(doc, y, c1, c2, c3, c4) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 170, y)
      .text(c3, 300, y, { width: 90, align: 'center'})
      .text(c4, 370, y, { width: 180, align: 'right'})
  }



  function generateProductsTable(doc, requisition, products, top) {

    top = top + 30;

    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      top,
      "Item",
      "Description",
      "Quantity",
      "Distribution"
    );
    generateHr(doc, top + 20);
    doc.font("Helvetica");

    // Get unique products
    let i = 0;
    const unique_product_ids = getUniqueProducts(requisition);

    for (const product_id of unique_product_ids) {

        const position = top + (i + 1) * 30;

        const product = products.find(product => product.id === product_id);

        generateTableRow(
            doc,
            position,
            product.sku,
            `${product.name} (${product.metric_amount}${product.metric})`,
            getCurrentUnits(requisition, product_id),
            `${getCurrentDisplayUnits(requisition, product_id, false)} ${getCurrentDisplayUnits(requisition, product_id, true)}`
        );
    
        generateHr(doc, position + 20);
        i++;
    }

    return top + (i + 1) * 30;
  } 
  


// Get PDF
const getRequisitionApprovalPdf = async (req, res, next) => {
    try {    
        // Create a document
        const { requisition_id } = req.params;

        const requisition = 
            await models.Requisition.query()
                    .findById(requisition_id)
                    .withGraphFetched(`
                        [
                            client.[
                                client_collaborators.[
                                    account
                                ]
                            ],
                            brief.[
                                agency.[
                                    agency_collaborators.[
                                        account
                                    ]
                                ],
                                brief_events.[
                                    orders.[
                                        product
                                    ],
                                    venue
                                ]
                            ],
                            orders.[
                                product.[
                                    ingredients
                                ]
                            ]
                        ]
                    `)

        const products = await models.Product.query().where('client_id', requisition.client.id);

        res.setHeader('Content-disposition', 'attachment; filename="' + 'test.pdf' + '"')
        res.setHeader('Content-type', 'application/pdf')
        
        let doc = new PDFDocument({ margin: 50 });

        let top;

        await generateHeader(doc, requisition);
        await generateCustomerInformation(doc, requisition);
        top = await generateEvents(doc, requisition);
        top = await generateProductHeader(doc, top);
        top = await generateProductsTable(doc, requisition, products, top);
        top = await generateSignature(doc, top);

        doc.pipe(res)
        doc.end();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}

const helloSignPDF = async (requisition_id) => {
    try {
        const requisition = 
            await models.Requisition.query()
                    .findById(requisition_id)
                    .withGraphFetched(`
                        [
                            client.[
                                client_collaborators.[
                                    account,
                                    role
                                ]
                            ],
                            brief.[
                                agency.[
                                    agency_collaborators.[
                                        account
                                    ]
                                ],
                                brief_events.[
                                    orders.[
                                        product
                                    ],
                                    venue
                                ]
                            ],
                            orders.[
                                product.[
                                    ingredients
                                ]
                            ]
                        ]
                    `)
        
        const products = await models.Product.query().where('client_id', requisition.client.id);
        
        let doc = new PDFDocument({ margin: 50 });

        let top;

        await generateHeader(doc, requisition);
        await generateCustomerInformation(doc, requisition);
        top = await generateEvents(doc, requisition);
        top = await generateProductHeader(doc, top);
        top = await generateProductsTable(doc, requisition, products, top);
        await generateSignature(doc, top);


        doc.pipe(fs.createWriteStream(`temporal/${requisition.client.id}_${requisition.serial_number}.pdf`));
        doc.end();
        return requisition; 
    } catch (e) {
        console.log(e)
    }
}


const pdfController = {
    getRequisitionApprovalPdf,
    helloSignPDF
}

export default pdfController;