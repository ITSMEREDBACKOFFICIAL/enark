import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

serve(async (req) => {
  const { event, record } = await req.json()

  // Trigger on order status update to 'paid' or 'shipped'
  if (event === "UPDATE" && record.status === "paid") {
    const { email, id, total_amount } = record

    const { data, error } = await resend.emails.send({
      from: "HORIZON <orders@horizon-maison.com>",
      to: [email],
      subject: `Order Confirmed: ${id}`,
      html: `
        <h1>HORIZON MAISON</h1>
        <p>Your order #${id} has been confirmed.</p>
        <p>Total: ₹${total_amount}</p>
        <p>We are preparing your garments for delivery.</p>
      `,
    })

    if (error) return new Response(JSON.stringify(error), { status: 500 })
    return new Response(JSON.stringify(data), { status: 200 })
  }

  return new Response(JSON.stringify({ message: "No action taken" }), { status: 200 })
})
