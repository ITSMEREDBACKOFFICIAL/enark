import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
const FOUNDER_EMAIL = Deno.env.get("FOUNDER_EMAIL")

serve(async (req) => {
  const { event, record } = await req.json()

  // Trigger for every successful transaction
  if (event === "INSERT" || (event === "UPDATE" && record.status === "paid")) {
    const { id, total_amount, email } = record

    await resend.emails.send({
      from: "HORIZON ALERTS <alerts@horizon-maison.com>",
      to: [FOUNDER_EMAIL],
      subject: `🔥 NEW SALE: ₹${total_amount}`,
      html: `
        <h2>New Transaction Successful</h2>
        <p><strong>Order ID:</strong> ${id}</p>
        <p><strong>Customer:</strong> ${email}</p>
        <p><strong>Amount:</strong> ₹${total_amount}</p>
        <hr/>
        <p>Check the <a href="https://horizon-maison.com/_command">Command Center</a> for details.</p>
      `,
    })

    return new Response(JSON.stringify({ status: "Alert Sent" }), { status: 200 })
  }

  return new Response(JSON.stringify({ message: "No alert triggered" }), { status: 200 })
})
