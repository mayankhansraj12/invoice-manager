const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Invoice = require('./models/Invoice');
const InvoiceLine = require('./models/InvoiceLine');
const Payment = require('./models/Payment');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    await Invoice.deleteMany();
    await InvoiceLine.deleteMany();
    await Payment.deleteMany();

    const invoices = [
        {
            invoiceNumber: 'INV-2024-001',
            customerName: 'Reliance Industries',
            issueDate: new Date('2024-01-15'),
            dueDate: new Date('2024-02-15'),
            status: 'PAID',
            total: 50000,
            amountPaid: 50000,
            balanceDue: 0,
            items: [
                { description: 'Enterprise Software License - Jan', quantity: 1, unitPrice: 30000 },
                { description: 'On-site Support (Mumbai)', quantity: 10, unitPrice: 2000 }
            ]
        },
        {
            invoiceNumber: 'INV-2024-002',
            customerName: 'Tata Consultancy Services',
            issueDate: new Date('2024-02-01'),
            dueDate: new Date('2024-02-15'),
            status: 'PARTIALLY_PAID',
            total: 125000,
            amountPaid: 50000,
            balanceDue: 75000,
            items: [
                { description: 'Cloud Migration Project (Phase 1)', quantity: 1, unitPrice: 100000 },
                { description: 'DevOps Consultation', quantity: 5, unitPrice: 5000 }
            ]
        },
        {
            invoiceNumber: 'INV-2024-003',
            customerName: 'Flipkart Internet Pvt Ltd',
            issueDate: new Date('2024-02-10'),
            dueDate: new Date('2024-03-10'),
            status: 'DRAFT',
            total: 850000,
            amountPaid: 0,
            balanceDue: 850000,
            items: [
                { description: 'AI Recommendation Engine', quantity: 1, unitPrice: 500000 },
                { description: 'Data Analysis Services', quantity: 100, unitPrice: 3500 }
            ]
        },
        {
            invoiceNumber: 'INV-2024-004',
            customerName: 'Infosys Limited',
            issueDate: new Date('2023-12-01'),
            dueDate: new Date('2024-01-01'),
            status: 'OVERDUE',
            total: 25000,
            amountPaid: 0,
            balanceDue: 25000,
            items: [
                { description: 'Cybersecurity Audit', quantity: 1, unitPrice: 25000 }
            ]
        }
    ];

    for (const invData of invoices) {
        const { items, ...invoiceFields } = invData;
        
        const invoice = await Invoice.create(invoiceFields);
        
        const lineItems = items.map(item => ({
            ...item,
            invoiceId: invoice._id,
            lineTotal: item.quantity * item.unitPrice
        }));

        await InvoiceLine.insertMany(lineItems);
        
        // Add a payment document for the paid/partial ones for realism
        if (invoice.amountPaid > 0) {
             await Payment.create({
                 invoiceId: invoice._id,
                 amount: invoice.amountPaid,
                 paymentDate: new Date(invoice.issueDate.getTime() + 86400000 * 5) // 5 days after issue
             });
        }
        
        console.log(`Created invoice ${invoice.invoiceNumber}`);
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
