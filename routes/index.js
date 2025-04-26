import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

// Stripe requires raw body, not JSON
app.use(bodyParser.raw({ type: "application/json" }));

// Webhook endpoint to listen to Stripe
app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout session completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment received!");
    console.log("Customer email:", session.customer_email);
    console.log("Metadata domain:", session.metadata.domain);
  }

  res.json({ received: true });
});

// Root route
app.get("/", (req, res) => {
  res.send("Hello from KaiSec Backend 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
