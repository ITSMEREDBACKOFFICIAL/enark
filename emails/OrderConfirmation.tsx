import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  customerName,
  totalAmount,
}) => (
  <div style={{ fontFamily: 'sans-serif', padding: '40px', backgroundColor: '#f9f9f9' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', border: '1px solid #eee' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '40px' }}>HORIZON</h1>
      <p>Dear {customerName},</p>
      <p>Thank you for your order. We are preparing your architectural garments with the utmost care.</p>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', margin: '20px 0' }}>
        <p><strong>Order ID:</strong> {orderId}</p>
        <p><strong>Total Amount:</strong> ₹{totalAmount.toLocaleString()}</p>
      </div>
      <p>You can track your order status in our portal using your email and order ID.</p>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <a href="https://horizon.com/track" style={{ backgroundColor: '#000', color: '#fff', padding: '12px 24px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>VIEW ORDER</a>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '40px 0' }} />
      <p style={{ fontSize: '10px', color: '#999', textAlign: 'center' }}>© 2024 HORIZON MAISON. ALL RIGHTS RESERVED.</p>
    </div>
  </div>
);
