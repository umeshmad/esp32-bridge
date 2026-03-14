export const mockDatabase = [{
        barcode: '8901234567890',
        name: 'Premium Ground Coffee',
        price: 1500,
        weight: 250
    },
    {
        barcode: '4901234567891',
        name: 'Organic Almond Milk',
        price: 850,
        weight: 1000
    },
    {
        barcode: '5901234567892',
        name: 'Whole Wheat Bread',
        price: 450,
        weight: 400
    },
    {
        barcode: '6901234567893',
        name: 'Fresh Apples (1kg)',
        price: 1200,
        weight: 1000
    },
    {
        barcode: '7901234567894',
        name: 'Dark Chocolate 70%',
        price: 900,
        weight: 100
    },
    {
        barcode: '12345',
        name: 'Test Product 1',
        price: 100,
        weight: 50
    },
    {
        barcode: '54321',
        name: 'Test Product 2',
        price: 200,
        weight: 150
    }
];

export const findProductByBarcode = (barcode) => {
    return mockDatabase.find(p => p.barcode === barcode);
};