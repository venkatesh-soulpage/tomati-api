import models from '../models'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import queryString from 'query-string';
import PDFDocument from 'pdfkit';
import fs from 'fs';

const invoice = {
    shipping: {
      name: "John Doe",
      address: "1234 Main Street",
      city: "San Francisco",
      state: "CA",
      country: "US",
      postal_code: 94111
    },
    items: [
      {
        item: "ABSOLUT_NORMAL",
        description: "Absolut Normal (750ml)",
        quantity: 60,
        distribution: "55 Consumption / 5 Display "
      },
      {
        item: "ABSOLUT_RASPBERRY",
        description: "Absolut Raspberry (750ml)",
        quantity: 60,
        distribution: "50 Consumption / 10 Display "
      }
    ],
    subtotal: 8000,
    paid: 0,
    invoice_nr: 1234
  };

const  generateHeader = async (doc) => {

    const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPgAAAAaCAMAAACtg2GwAAAAUVBMVEVHcEx6uodUZKhUZqh4t4ZVZqllk45SZ6dUZqdUZad6u4d6uoZUZql4uYV5uoZ7u4d7u4dVZalVZah6u4Z5uohVZqlVZql6u4dVZqhVZqlVZ6liaRYWAAAAF3RSTlMAm0OcIdwQIYBg33q/RWC/7+9wz7Cvr3/crFMAAAS2SURBVFjDrZiJdqsgEEBFERQkbklt/f8PfezMAEl8Teec9iSOYu7s0DRvpB1y4frqWFwdwCPbo9cydW25HNs6o+sfI88U44aW6wgSKVW2kiJ3sRxiJrmCybvQMpMbRVeJEIfY78VCT6T7zsXgTMXV74g9/Wg57b9+zKw4eZX56wA6LxY8j1zEDWIsdUVDZ/DIrN7eryW68xNwbrGT9GBB1mHdT4wS3pfrHaXISCcym0TfqgVrCH19v5HTyPgZOO8ztvPcIneu+zk7r6pw18APVac7jsVraKHZmX6zeLbSX4EX3EbCkjWdI2+/L4LPT+g0ufOhqEYJKa6S33q8q4NHtv7rK8b86qJ9iN+naVrDlw2+o5+sQHAxWwmoDMWtUcbPRqW8FXQtvItE6J+epSR7uvkNOJQEznxw9qgmjJ5msuWcB9TJfgsmcaV+9DZazU94pIXTa9yP9XWIeUAK/Efsr6cEuFZC7yuCzeGi29y/oBSH4LYddS/AY3ROUN/nNcs71saIy+qexXqWbu7wUhXw5hbB6YE1QbWwYJMl1kBX2tKz/mpW1QH4ZD6+BG8GT76BZgXzFoaAvsKKIu+t0uuPm4ueV+DOlyJhyPQWEq/4T/sNhfItdDFaD+Q6OONJUERO3zhAg1N/YPRPAa7FhQ4kvb6duZUG9gycqZSxc9GQmMvhO6xis1QRnqYSTxS7Cj5WixvovTF4faSj4N8cHAOUyeXJFsO1qm5pl7IskxAOCveA4HjUBXZJw9iy/Qo8pvkjvH/NIz06mvto6JGl11QRhivgu/nFrOzDPg+OGA7JUhLq8VSjCfvfgccuFNI8K23Aq9zHPIoGHyHDk9eUvZeCuFWVJK6MaMfMmkojN6HzAXhI85MXHszA2yp4up9PVzwu1Fvw1N3wqJL7XLe5T8D5itK8L0N9xKG+ol1UGmGujqym1BVFHYa6b9/lcEqJyAa6d+B8TJKDhzT3sI8Szhf6WOXaMv/bmOEdeo132M2KFLFXCzC8enGZvUeLKjJXplMl5wUMv+/An/XxSppvRcvisdCXPT4YhQWHD6/6uJ/PU68GsU4r87eG9y6+o028t6Aecj4D97/5tPM4Q7M5YBtjQp9t3um0UXi2bg28iY1cHdm4HfZe1hSS5O3dxIbaaT7ufAru09yNohMez8L+2373jXwdMbcxigd/6XGW2rcAzc34ez/iVGecLxTOgLut9enwQV70eFvN8XQtBHuXslZHdMsYH1Z43hB341PLG755G9l3e/B1bI2EAdEXIWpFzSmc45RClFaQBRQ+5/zZzqYqm2SFHVzCUcz7HK9vSytVmKfQ9lBhP4ZqWbqe0mK9uh93AUBqGoI1qYzR0O0M/JIW+lPwpivPGuK+ZCh1J97wvAV3EzrbK1Mda/KJNRikdrto/hi8JAf7sW3NdGsbDqUugvvuzQqfuwGtkUvNVMU4ZzfkfwweTxhCfsPdUHYyNfHfHjY2N8SypFNIUjNIbihxZVb/X3CNHg+d+iHfBLZf0dvo1J0N/TvwBR+g3/a0A4VvgSNaPF1uqNzBpu3SuTrcjzsxr+GlQM+2m97ztby6ntENY6nL16OZFA9QJbWoZwqZbb2zq/8AoZBD+QiMLZcAAAAASUVORK5CYII='

    doc
      .image(image, 50, 65, { width: 150 })
      .fillColor("#444444")
      .fontSize(20)
      .fontSize(10)
      .text("#10004", 200, 65, { align: "right" })
      .text("Booze Boss Client", 200, 80, { align: "right" })
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

function generateSignature(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(200, y)
        .lineTo(400, y)
        .stroke();

    doc
        .fontSize(10)
        .text("Caesario De-Medeiros", 250, y + 15)
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

function generateCustomerInformation(doc, invoice) {

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
      .text('#10004', 150, customerInformationTop)
      .font("Helvetica")
      .text("Creation Date:", 50, customerInformationTop + 15)
      .text(formatDate(new Date()), 150, customerInformationTop + 15)
      .text("Requested by:", 50, customerInformationTop + 30)
      .text(
        'Booze Boss Agency',
        150,
        customerInformationTop + 30
      )
  
      /* .font("Helvetica-Bold")
      .text(invoice.shipping.name, 300, customerInformationTop)
      .font("Helvetica")
      .text(invoice.shipping.address, 300, customerInformationTop + 15)
      .text(
        invoice.shipping.city +
          ", " +
          invoice.shipping.state +
          ", " +
          invoice.shipping.country,
        300,
        customerInformationTop + 30
      )
      .moveDown(); */
  
    generateHr(doc, customerInformationTop + 52);
  }

const getEvent = async (doc, top) => {

    doc
      .fillColor("#444444")
      .fontSize(14)
      .text("Day 1", 50, top - 40);  

    generateHr(doc, top - 15);
    
    doc
        // First row
        .fontSize(10)
        .text("Setup Time:", 50, top)
        .font("Helvetica-Bold")
        .text('22/05/2020 10:00AM', 110, top)
        .font("Helvetica")
        .text("Start Time:", 220, top)
        .font("Helvetica-Bold")
        .text('22/05/2020 8:00PM', 280, top)
        .font("Helvetica")
        .text("End Time:", 390, top)
        .font("Helvetica-Bold")
        .text('23/05/2020 2:00AM', 450, top)
        
        // Second row
        .fontSize(10)
        .font("Helvetica")
        .text("Venue:", 50, top + 15)
        .font("Helvetica-Bold")
        .text('Bar (Street - Municipality - State)', 110, top + 15)
        
        // Third row
        .fontSize(10)
        .font("Helvetica")
        .text("Guests:", 50, top + 30)
        .font("Helvetica-Bold")
        .text('250', 110, top + 30)

  
    generateHr(doc, top + 52);
}
  
const generateEvents = async (doc, invoice) => {
    const customerInformationTop = 280;

    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Events", 50, customerInformationTop - 40);  

    await getEvent(doc, customerInformationTop + 40)
}

const generateProducts = async (doc) => {
    const customerInformationTop = 440;

    doc
        .font("Helvetica")
        .fillColor("#444444")
        .fontSize(20)
        .text("Required Products", 50, customerInformationTop - 40);  

    // await getEvent(doc, customerInformationTop + 40)
}

function generateTableRow(doc, y, c1, c2, c3, c4) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 170, y)
      .text(c3, 300, y, { width: 90})
      .text(c4, 370, y, { width: 180})
  }


  function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 450;
  
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Description",
      "Quantity",
      "Distribution"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
  
    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        item.item,
        item.description,
        item.quantity,
        item.distribution,
      );
  
      generateHr(doc, position + 20);
    }
  }
  


// Get PDF
const getPdf = async (req, res, next) => {
    try {    
        // Create a document
        res.setHeader('Content-disposition', 'attachment; filename="' + 'test.pdf' + '"')
        res.setHeader('Content-type', 'application/pdf')
        
        let doc = new PDFDocument({ margin: 50 });

        await generateHeader(doc);
        await generateCustomerInformation(doc, invoice);
        await generateEvents(doc, invoice);
        await generateProducts(doc);
        await generateInvoiceTable(doc, invoice);
        await generateSignature(doc, 600);
        await generateFooter(doc);

        doc.pipe(res)
        doc.end();
    } catch (e) {
        console.log(e);
        return res.status(500).json(JSON.stringify(e)).send();
    }
}




const pdfController = {
    getPdf
}

export default pdfController;