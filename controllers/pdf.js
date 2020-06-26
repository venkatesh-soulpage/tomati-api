import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

// Create the temporal directory on heroku
const temp_dir = path.join(process.cwd(), 'temporal/');
if (!fs.existsSync(temp_dir)) {
    fs.mkdirSync(temp_dir);
}


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
            `${requisition.brief.agency.name} (${requisition.created_by_account.first_name} ${requisition.created_by_account.last_name})`,
            150,
            customerInformationTop + 30
        )
    
    doc
        .fontSize(10)
        .text("Received by:", 350, customerInformationTop)
        .font("Helvetica-Bold")
        .text(`____________________`, 420, customerInformationTop)
        .font("Helvetica")
        .text("Date:", 350, customerInformationTop + 15)
        .text('____________________', 420, customerInformationTop + 15)
        .text("Signature:", 350, customerInformationTop + 30)
        .text(
            `____________________`,
            420,
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
                            ],
                            created_by_account
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
        // top = await generateSignature(doc, top);

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
                            ],
                            created_by_account,
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
        // await generateSignature(doc, top);


        doc.pipe(fs.createWriteStream(`temporal/${requisition.client.id}_${requisition.serial_number}.pdf`));
        doc.end();
        return requisition; 
    } catch (e) {
        console.log(e)
    }
}

/* Event Report */
const eventReportHeader = async (doc, top) => {
    const margin_top = 50;
    doc
        .fillColor("#444444")
        .fontSize(16)
        .text("Marketing Activity Report", 200, margin_top);

    return top + margin_top;
}

const eventData = async (doc, event, top) => {
    let margin_top = top + 65;

    doc
        .fontSize(12)
        .text("Report date:", 50, margin_top)
        .font("Helvetica")
        .text(`${moment().format('DD/MM/YYYY LT')}`, 120, margin_top)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Timestamp:", 300, margin_top)
        .font("Helvetica")
        .text(`${moment().unix()}`, 370, margin_top)
    
    margin_top = margin_top + 30; 

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Activity:", 50, margin_top)
        .font("Helvetica")
        .text(`${event.brief_event.name}`, 120, margin_top)
    
    margin_top = margin_top + 30; 
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Project:", 50, margin_top)
        .font("Helvetica")
        .text(`${event.brief_event.brief.name} (#${event.brief_event.brief.requisition.serial_number})`, 120, margin_top)
    
    margin_top = margin_top + 30; 
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Created by:", 50, margin_top)
        .font("Helvetica")
        .text(`${event.brief_event.brief.client_collaborator.account.first_name} ${event.brief_event.brief.client_collaborator.account.last_name}`, 120, margin_top)
    
    margin_top = margin_top + 30; 
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Owner:", 50, margin_top)
        .font("Helvetica")
        .text(`${event.brief_event.brief.client.name}`, 120, margin_top)
    
    margin_top = margin_top + 30; 
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Agency:", 50, margin_top)
        .font("Helvetica")
        .text(`${event.brief_event.brief.agency.name}`, 120, margin_top)
    
    margin_top = margin_top + 30; 
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Project Summary:", 50, margin_top)

    margin_top = margin_top + 15; 
    doc
        .font("Helvetica")
        .fontSize(12)
        .text(event.brief_event.brief.description, 50, margin_top)
    
    margin_top = margin_top + 30; 
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Activity Summary:", 50, margin_top)

    margin_top = margin_top + 15; 
    doc
        .font("Helvetica")
        .fontSize(12)
        .text(event.brief_event.comments, 50, margin_top)
    
    margin_top = margin_top + 30; 
    generateHr(doc, margin_top);

    return margin_top;
}

function generateEventTableRow(doc, y, c1, c2, c3) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 250, y)
      .text(c3, 450, y)
      // .text(c4, 370, y, { width: 180, align: 'right'})

    generateHr(doc, y + 15)
  }

const eventDescription = async (doc, event, top) => {
     let margin_top = top + 30;

    doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`High level activity summary`, 50, margin_top)
    
    margin_top = margin_top + 30; 

    const calculateOrder = (orders) => {
        const total_order = orders.reduce((acc, curr) => {
            return acc + Number(curr.units * curr.product.metric_amount);
        }, 0)
        return `${(total_order / 1000)} L`;
    }

    const calculateTotalVolume = (products) => {
        const actual_volume = products.reduce((pacc, pcurr) => {

            return pacc + Number(pcurr.product.metric_amount * pcurr.transactions.length);
        }, 0)

        return `${(actual_volume / 1000)} L`;
    }

    const checkedInGuests = (guests) => {
        return guests.filter(guest => guest.checked_in).length;
    }
    
    // Generate table row 
    generateEventTableRow(doc, margin_top, 'Item', 'Briefed', 'Actual');
    generateEventTableRow(doc, margin_top + 30, 'Event Start Time', moment(event.brief_event.start_time).format('DD/MM/YYYY LT'), moment(event.started_at).format('DD/MM/YYYY LT'));
    generateEventTableRow(doc, margin_top + 60, 'Event End Time', moment(event.brief_event.end_time).format('DD/MM/YYYY LT'), moment(event.ended_at).format('DD/MM/YYYY LT'));
    generateEventTableRow(doc, margin_top + 90, 'Volume Depletion', calculateOrder(event.brief_event.brief.requisition.orders), calculateTotalVolume(event.products));
    generateEventTableRow(doc, margin_top + 120, 'Attendance', event.brief_event.expected_guests, checkedInGuests(event.guests));

    return margin_top + 120;
}

const eventAttendance = (doc, event, top) => {

    const calculate_gender_amount = (guests, gender) => {
        return guests.filter(guest => guest.check_in_time && guest.account && guest.account.gender === gender).length;
    }

    const calculate_gender_average_date = (guests, gender) => {
        const gender_guests = guests.filter(guest => guest.check_in_time && guest.account && guest.account.gender === gender);
        const gender_age_amount = gender_guests.reduce((acc, curr) => {
            return acc +  Number(moment(curr.account.date_of_birth, "MM/DD/YYYY").fromNow().split(" ")[0]);
        }, 0)

        return gender_guests.length > 0 ? Math.round(gender_age_amount / gender_guests.length) : 0;
    }

    const average_duration = (event) => {
        const {guests} = event;
        const checked_in_guests = guests.filter(guest => guest.check_in_time);
        const total_time = checked_in_guests.reduce((acc, curr) => {
            const start_time = moment(curr.check_in_time);
            const end_time = curr.check_out_time ? moment(curr.check_out_time) : moment(event.ended_at);
        
            const duration = moment.duration(end_time.diff(start_time));

            return acc + Number(duration.asMinutes());
        }, 0);

        return Math.round(total_time / checked_in_guests.length );
    }

    const most_check_ins = (event) => {
        const start_time = moment(event.started_at);
        const end_time = moment(event.ended_at);
        const duration = moment.duration(end_time.diff(start_time));
        const hours = Math.round(duration.asHours());

        const ranges = [];
        for (let hour = 0; hour < hours; hour++) {
            // Calculate range and add hours
            const low_range = moment(event.started_at).add(hour, 'hours');
            const upper_range = moment(event.started_at).add(hour + 1, 'hours');
            const checked_in_guests = event.guests.filter(guest => {
                const was_on_event = guest.check_in_time ;
                const check_in_before_upper_range = moment.duration(upper_range.diff(moment(guest.check_in_time))).asMinutes() < 60;
                const check_in_after_lower_range = moment.duration(moment(guest.check_in_time).diff(low_range)).asMinutes() < 60;
                
                return was_on_event && check_in_before_upper_range && check_in_after_lower_range;
            })

            ranges.push({
                time: `${low_range.format('DD/MM/YYYY LT')} - ${upper_range.format('DD/MM/YYYY LT')}`,
                amount: checked_in_guests.length
            })
        }

        const best_hour = ranges.sort( 
            function(a, b) {
               return parseFloat(b['amount']) - parseFloat(a['amount']);
            }
          )[0];

        return `${best_hour.time} : ${best_hour.amount} guests`;
    }

    const most_check_outs = (event) => {
        const start_time = moment(event.started_at);
        const end_time = moment(event.ended_at);
        const duration = moment.duration(end_time.diff(start_time));
        const hours = Math.round(duration.asHours());

        const ranges = [];
        for (let hour = 0; hour < hours; hour++) {
            // Calculate range and add hours
            const low_range = moment(event.started_at).add(hour, 'hours');
            const upper_range = moment(event.started_at).add(hour + 1, 'hours');
            const checked_out_guests = event.guests.filter(guest => {
                const check_out_time = guest.check_out_time ? moment(guest.check_out_time) : moment(event.ended_at).add(-5, 'minutes');
                const was_on_event = guest.check_in_time;
                const check_out_before_upper_range = moment.duration(upper_range.diff(check_out_time)).asMinutes() < 60;
                const check_out_after_lower_range = moment.duration(check_out_time.diff(low_range)).asMinutes() < 60;
                
                return was_on_event && check_out_before_upper_range && check_out_after_lower_range;
            })

            ranges.push({
                time: `${low_range.format('DD/MM/YYYY LT')} - ${upper_range.format('DD/MM/YYYY LT')}`,
                amount: checked_out_guests.length
            })
        }

        const best_hour = ranges.sort( 
            function(a, b) {
               return parseFloat(b['amount']) - parseFloat(a['amount']);
            }
          )[0];

        return `${best_hour.time} : ${best_hour.amount} guests`;
    }

    let margin_top = top + 45;
    
    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Attendance Details", 50, margin_top);

    margin_top = margin_top + 30;

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Gender Distribution:", 50, margin_top)
        .font("Helvetica")
        .text(
            `${calculate_gender_amount(event.guests, 'MALE')} M | ${calculate_gender_amount(event.guests, 'FEMALE')} F | ${calculate_gender_amount(event.guests, 'OTHER')} O`, 
            200, 
            margin_top
        )
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Age Distribution", 350, margin_top)
        .font("Helvetica")
        .text(
            `${calculate_gender_average_date(event.guests, 'MALE')} M | ${calculate_gender_average_date(event.guests, 'FEMALE')} F | ${calculate_gender_average_date(event.guests, 'OTHER')} O`, 
            450, 
            margin_top
        );

    margin_top = margin_top + 15;

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Average Duration:", 50, margin_top)
        .font("Helvetica")
        .text(
            `${average_duration(event)} minutes`,
            200, 
            margin_top
        )
    
    margin_top = margin_top + 15;

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Attendance Peak", 50, margin_top)
        .font("Helvetica")
        .text(
            `${most_check_ins(event)}`,
            200, 
            margin_top
        )
    
    margin_top = margin_top + 15;

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Attendance Dwindled", 50, margin_top)
        .font("Helvetica")
        .text(
            `${most_check_outs(event)}`,
            200, 
            margin_top
        )

    return margin_top;
}

const eventConsumption = async (doc, event, top) => {
    let margin_top = 50;
    const demographics = [
        {name: 'Boomer', min_age: 56, max_age: 76},
        {name: 'Gen X', min_age: 41, max_age: 55},
        {name: 'Millenials Y2', min_age: 30, max_age: 40},
        {name: 'Millenials Y1', min_age: 25, max_age: 29 },
        {name: 'Gen Z', min_age: 18, max_age: 24 },
    ]


    const getDemographicMetrics = (transactions, demographic, gender ) => {
        const total_transactions = transactions.length;
        const gender_transactions = transactions.filter(transaction => transaction.wallet.account.gender === gender);
        
        const demographic_group = demographics.find(demographic_value => demographic_value.name === demographic);
        
        const demographic_transactions = gender_transactions.filter((gender_transaction) => {
            const age = Number(moment(gender_transaction.wallet.account.date_of_birth, "MM/DD/YYYY").fromNow().split(" ")[0]);
            const is_inside_demographic = demographic_group.min_age <= age && demographic_group.max_age >= age;
            return is_inside_demographic;
        })
        return gender_transactions.length < 1 ? `0% ${gender}` : `${Math.round(demographic_transactions.length / total_transactions * 10000) / 100}% ${gender}`;

    }

    const getDemographicTotals = (products, demographic) => {
        const all_transactions = [];
        products.map(product => {
            product.transactions.map(tx => all_transactions.push(tx));
        });

        const demographic_group = demographics.find(demographic_value => demographic_value.name === demographic);

        const demographic_transactions = 
            all_transactions.filter(tx => {
                const age = Number(moment(tx.wallet.account.date_of_birth, "MM/DD/YYYY").fromNow().split(" ")[0]);
                const is_inside_demographic = demographic_group.min_age <= age && demographic_group.max_age >= age;
                return is_inside_demographic;
            })

        if (all_transactions.length < 1) return `0%`; 
        return demographic_transactions.length < 1 ? `0%` : `${Math.round(demographic_transactions.length / all_transactions.length * 10000) / 100}%`;

    }

    doc.addPage();

    // Make demographic consumption 
    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text('Demographic Group', 50, margin_top)
        .text('Gen Z', 200, margin_top)
        .text('Millenial Y1', 275, margin_top)
        .text('Millenial Y2', 350, margin_top)
        .text('Gen X', 425, margin_top)
        .text('Boomer', 500, margin_top)
    
    margin_top = margin_top + 15;
    generateHr(doc, margin_top);

    for (let product_index = 0; product_index < event.products.length; product_index++) {
        
        margin_top = margin_top + 60;

        doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(event.products[product_index].product.name, 50, margin_top - 45, {
                width: 130,
                align: 'left'
            })
            .font("Helvetica")
            .fontSize(8)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Gen Z', 'MALE'), 200, margin_top - 45)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Gen Z', 'FEMALE'), 200, margin_top -30)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Gen Z', 'OTHER'), 200, margin_top - 15)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Millenials Y1', 'MALE'), 275, margin_top - 45)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Millenials Y1', 'FEMALE'), 275, margin_top -30)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Millenials Y1', 'OTHER'), 275, margin_top - 15)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Millenials Y2', 'MALE'), 350, margin_top - 45)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Millenials Y2', 'FEMALE'), 350, margin_top -30)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Millenials Y2', 'OTHER'), 350, margin_top - 15)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Gen X', 'MALE'), 425, margin_top - 45)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Gen X', 'FEMALE'), 425, margin_top -30)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Gen X', 'OTHER'), 425, margin_top - 15)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Boomer', 'MALE'), 500, margin_top - 45)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Boomer', 'FEMALE'), 500, margin_top -30)
            .text(getDemographicMetrics(event.products[product_index].transactions, 'Boomer', 'OTHER'), 500, margin_top - 15)

        
        margin_top = margin_top + 10;
        generateHr(doc, margin_top);
    }

    margin_top = margin_top + 50;
    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text('Total', 50, margin_top - 30, {
            width: 130,
            align: 'left'
        })
        .fontSize(8)
        .text(getDemographicTotals(event.products, 'Gen Z'), 200, margin_top - 30)
        .text(getDemographicTotals(event.products, 'Millenials Y1'), 275, margin_top - 30)
        .text(getDemographicTotals(event.products, 'Millenials Y2'), 350, margin_top - 30)
        .text(getDemographicTotals(event.products, 'Gen X'), 425, margin_top - 30)
        .text(getDemographicTotals(event.products, 'Boomer'), 500, margin_top - 30)
}

const eventSales = async (doc, event, top) => {
    let margin_top = 50;

    const demographics = [
        {name: 'Boomer', min_age: 56, max_age: 76},
        {name: 'Gen X', min_age: 41, max_age: 55},
        {name: 'Millenials Y2', min_age: 30, max_age: 40},
        {name: 'Millenials Y1', min_age: 25, max_age: 29 },
        {name: 'Gen Z', min_age: 18, max_age: 24 },
    ]

    const most_profitable_demographic = (event) => {
        const all_transactions = [];
        event.products.map(product => {
            product.transactions.map(tx => all_transactions.push(tx));
        });

        const available_demographics = [ 'Gen Z', 'Millenials Y1', 'Millenials Y2', 'Gen X', 'Boomer'];
        const available_gender = ['MALE', 'FEMALE', 'OTHER'];

        const calculated_values = [];

        for (const available_demographic of available_demographics) {
            for (const gender of available_gender) {
                const demographic_group = demographics.find(demographic_value => demographic_value.name === available_demographic);

                const demographic_transactions = 
                    all_transactions
                        .filter(tx => tx.wallet.account.gender === gender)
                        .filter(tx => {
                            const age = Number(moment(tx.wallet.account.date_of_birth, "MM/DD/YYYY").fromNow().split(" ")[0]);
                            const is_inside_demographic = demographic_group.min_age <= age && demographic_group.max_age >= age;
                            return is_inside_demographic;
                        });
                
                const total_consumption = 
                        demographic_transactions
                            .reduce((acc, curr) => {
                                return acc + Number(curr.event_product.price);
                            }, 0);
                
                calculated_values.push({ name: `${demographic_group.name} (${gender})`, total_consumption });
            }
        }

        const max = calculated_values.sort( 
            function(a, b) {
               return parseFloat(b['total_consumption']) - parseFloat(a['total_consumption']);
            }
        )[0]

        return `${max.name} : ${max.total_consumption} credits`;
    }

    const less_profitable_demographic = (event) => {
        const all_transactions = [];
        event.products.map(product => {
            product.transactions.map(tx => all_transactions.push(tx));
        });

        const available_demographics = [ 'Gen Z', 'Millenials Y1', 'Millenials Y2', 'Gen X', 'Boomer'];
        const available_gender = ['MALE', 'FEMALE', 'OTHER'];

        const calculated_values = [];

        for (const available_demographic of available_demographics) {
            for (const gender of available_gender) {
                const demographic_group = demographics.find(demographic_value => demographic_value.name === available_demographic);

                const demographic_transactions = 
                    all_transactions
                        .filter(tx => tx.wallet.account.gender === gender)
                        .filter(tx => {
                            const age = Number(moment(tx.wallet.account.date_of_birth, "MM/DD/YYYY").fromNow().split(" ")[0]);
                            const is_inside_demographic = demographic_group.min_age <= age && demographic_group.max_age >= age;
                            return is_inside_demographic;
                        });
                
                const total_consumption = 
                        demographic_transactions
                            .reduce((acc, curr) => {
                                return acc + Number(curr.event_product.price);
                            }, 0);
                
                if (total_consumption > 0) {
                    calculated_values.push({ name: `${demographic_group.name} (${gender})`, total_consumption });
                }
                
            }
        }

        const min = calculated_values.sort( 
            function(a, b) {
               return parseFloat(a['total_consumption']) - parseFloat(b['total_consumption']);
            }
        )[0]

        return `${min.name} : ${min.total_consumption} credits`;
    }

    const most_profitable_hour = (event) => {

        const all_transactions = [];
        event.products.map(product => {
            product.transactions.map(tx => all_transactions.push(tx));
        });

        const start_time = moment(event.started_at);
        const end_time = moment(event.ended_at);
        const duration = moment.duration(end_time.diff(start_time));
        const hours = Math.round(duration.asHours());

        const ranges = [];
        for (let hour = 0; hour < hours; hour++) {
            // Calculate range and add hours
            const low_range = moment(event.started_at).add(hour, 'hours');
            const upper_range = moment(event.started_at).add(hour + 1, 'hours');
            const products_sold = all_transactions.filter(tx => {
                const sold_before_upper_range = moment.duration(upper_range.diff(moment(tx.created_at))).asMinutes() < 60;
                const sold_after_lower_range = moment.duration(moment(tx.created_at).diff(low_range)).asMinutes() < 60;
                
                return sold_before_upper_range && sold_after_lower_range;
            })

            ranges.push({
                time: `${low_range.format('DD/MM/YYYY LT')} - ${upper_range.format('DD/MM/YYYY LT')}`,
                amount: products_sold.length
            })
        }

        const best_hour = ranges.sort( 
            function(a, b) {
               return parseFloat(b['amount']) - parseFloat(a['amount']);
            }
          )[0];

        return `${best_hour.time} : ${best_hour.amount} products sold`;
    }
    
    doc.addPage();

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text('Menu Item', 50, margin_top)
        .text('Sales (Units)', 275, margin_top)
        .text('Sales (Value)', 425, margin_top)

    margin_top = margin_top + 15;
    generateHr(doc, margin_top);

    for (const product of event.products) {
        margin_top = margin_top + 30;

        doc
            .font("Helvetica")
            .fontSize(12)
            .text(product.product.name, 50, margin_top - 15, { width: 200, align: 'left'})
            .text(product.transactions.length, 275, margin_top - 15, { width: 75, align: 'center'})
            .text(product.price * product.transactions.length, 425, margin_top - 15, { width: 75, align: 'center'})

        margin_top = margin_top + 20;
        generateHr(doc, margin_top);
    }

    margin_top = margin_top + 30; 

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Most profitable demographic:", 50, margin_top)
        .font("Helvetica")
        .text(
            `${most_profitable_demographic(event)}`,
            270, 
            margin_top
        )
    
    margin_top = margin_top + 30; 

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Less profitable demographic:", 50, margin_top)
        .font("Helvetica")
        .text(
            `${less_profitable_demographic(event)}`,
            270, 
            margin_top
        )
    margin_top = margin_top + 30; 

    doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Most profitable hour:", 50, margin_top)
        .font("Helvetica")
        .text(
            `${most_profitable_hour(event)}`,
            270, 
            margin_top
        )

    return margin_top;
}

const eventStock = (doc, event, products, top) => {
    const get_unique_brands = (event) => {
        const {orders} = event.brief_event;

        // Filter the products for the brand
        // Products for brands
        const category_products = 
                orders
                    .filter(order => !order.product.is_cocktail)
                    .map(order => order.product_id);
            
        const cocktail_products_id = [];
        orders   
            .filter(order => order.product.is_cocktail)
            .map(order => {
                order.product.ingredients.map(ing => {
                    cocktail_products_id.push(ing.product_id);
                })
            })   

        const all_ids = [...category_products, ...cocktail_products_id];
        return [...new Set(all_ids)];
    }

    const getCurrentUnits = (event, product_id) => {
        const {orders} = event.brief_event;
        
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

    const get_brand_consumption = (event, product) => {
        // Get the correct consumption
        const products = event.products.filter(event_product => {
            const is_brand = event_product.product_id === product.id;
            const ingredients_ids = event_product.product.ingredients.map(ing => ing.product_id);
            const has_ingredient = ingredients_ids.indexOf(product.id) > -1;
            return is_brand || has_ingredient;
        })

        const total_metric_amount = 
            products.reduce((acc, curr) => {
                if (!curr.product.is_cocktail) {
                    return acc + Number(curr.product.metric_amount);
                } else if (curr.product.is_cocktail) {
                    const ingredient = curr.product.ingredients.find(ing => ing.product_id === product.id);
                    if (ingredient) {
                        return acc + Number(ingredient.quantity);
                    }
                } else {
                    return acc;
                }
            }, 0);


        const units = total_metric_amount / product.metric_amount;
        return units;
        
    }

    const unique_brands = get_unique_brands(event);

    let margin_top = top + 60;

    doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text('Menu Item', 50, margin_top)
        .text('Opening Stock', 250, margin_top)
        .text('Consumption', 350, margin_top)
        .text('Closing Stock', 450, margin_top)

    margin_top = margin_top + 15;
    generateHr(doc, margin_top)

    
    for (const brand of unique_brands) {
        margin_top = margin_top + 30;
        const current_brand = products.find(prod => brand === prod.id);

        doc
        .font("Helvetica")
        .fontSize(10)
        .text(current_brand.name, 50, margin_top)
        .text(getCurrentUnits(event, current_brand.id), 250, margin_top)
        .text(get_brand_consumption(event, current_brand), 350, margin_top)
        .text(getCurrentUnits(event, current_brand.id) - get_brand_consumption(event, current_brand), 450, margin_top)
    }

}

const eventReport = async (req, res, next) => {
    try {
        const { account_id } = req;
        const { event_id } = req.params;

        const event =
                await models.Event.query()
                        .withGraphFetched(`[
                            brief_event.[
                                brief.[
                                    requisition.[
                                        orders.[
                                            product
                                        ]
                                    ],
                                    client_collaborator.[
                                        account
                                    ],
                                    client,
                                    agency
                                ],
                                orders.[
                                    product.[
                                        ingredients
                                    ]
                                ]
                            ],
                            products.[
                                product.[
                                    ingredients
                                ],
                                transactions.[
                                    wallet.[
                                        account
                                    ],
                                    event_product
                                ]
                            ],
                            guests.[
                                account
                            ],
                        ]`)
                        .where('id', event_id)
                        .first();

        const products = 
            await models.Product.query()
                        .where({client_id: event.brief_event.brief.client_id});

        let doc = new PDFDocument({ margin: 50 });

        let top = 0; 
        
        top = await eventReportHeader(doc, top);
        top = await eventData(doc, event, top);
        top = await eventDescription(doc, event, top);
        top = await eventAttendance(doc, event, top);
        top = await eventConsumption(doc, event, top);
        top = await eventSales(doc, event, top);
        top = await eventStock(doc, event, products, top);

        doc.pipe(res)
        doc.end();

    } catch (e) {
        console.log(e);
    }
}

const pdfController = {
    getRequisitionApprovalPdf,
    helloSignPDF,
    eventReport
}

export default pdfController;