const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const Transaction = require('./models/Transaction');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transaction', async (req, res) => {
    try {
        const { name, price, description, datetime, category } = req.body;
        const newTransaction = await Transaction.create({
            name,
            price,
            description,
            datetime,
            category,
        });
        res.status(201).json({ newTransaction, success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/transaction/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTransaction = await Transaction.findByIdAndDelete(id);
        res.json({ deletedTransaction, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/transactions/export', async (req, res) => {
    try {
        const format = req.query.format;
        if (format === 'csv') {
            const transactions = await Transaction.find();
            const csvData = transactions
                .map((transaction) => [
                    transaction.name,
                    transaction.price.toString(),
                    transaction.description,
                    transaction.datetime.toISOString(),
                    transaction.category,
                ])
                .join('\n');
            res.header('Content-Type', 'text/csv');
            res.attachment('transactions.csv');
            res.send(csvData);
        } else if (format === 'pdf') {
            const transactions = await Transaction.find();

            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream('transactions.pdf'));

            pdfDoc.fontSize(14).text('Expense Tracker - Transactions', {
                underline: true,
                align: 'center',
            });
            pdfDoc.moveDown();

            for (const transaction of transactions) {
                pdfDoc.fontSize(12).text(`Name: ${transaction.name}`);
                pdfDoc.fontSize(12).text(`Price: ${transaction.price}`);
                pdfDoc.fontSize(12).text(`Description: ${transaction.description}`);
                pdfDoc.fontSize(12).text(`Date: ${transaction.datetime}`);
                pdfDoc.fontSize(12).text(`Category: ${transaction.category}`);
                pdfDoc.moveDown();
            }

            pdfDoc.end();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');

            pdfDoc.pipe(res);
        } else {
            res.status(400).json({ error: 'Invalid export format' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        app.listen(4000, () => console.log('Server started on port 4000'));
    })
    .catch((err) => console.log(err));
