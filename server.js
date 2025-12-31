const express = require("express");
const cors = require("cors");
const XLSX = require("xlsx");

const app = express();
app.use(cors());
app.use(express.json());

// Load Excel file
const workbook = XLSX.readFile("INFACT_Retail_Monthly_Data.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Chatbot endpoint
app.post("/ask", (req, res) => {
  const question = req.body.question.toLowerCase().trim();

  /* ---------------- GREETINGS ---------------- */
  if (
    question === "hi" ||
    question === "hello" ||
    question === "hey" ||
    question.includes("good morning") ||
    question.includes("good afternoon")
  ) {
    return res.json({
      answer: "Hello! 👋 How can I help you with the retail data today?",
    });
  }

  /* ---------------- SHOP NAME ---------------- */
  if (
    question.includes("shop name") ||
    question.includes("retail shop") ||
    question.includes("name of the retail")
  ) {
    return res.json({
      answer: `The retail shop name is ${data[0].Retail_Shop_Name}.`,
    });
  }

  /* ---------------- MOST SOLD PRODUCT ---------------- */
  if (
    question.includes("most sold") ||
    question.includes("sells the most")
  ) {
    const totals = {};
    data.forEach((item) => {
      totals[item.Product_Name] =
        (totals[item.Product_Name] || 0) + item.Quantity_Sold;
    });

    const top = Object.entries(totals).reduce((a, b) =>
      b[1] > a[1] ? b : a
    );

    return res.json({
      answer: `The most sold product this month is ${top[0]}.`,
    });
  }

  /* ---------------- CHEAPEST PRODUCT ---------------- */
  if (question.includes("cheapest")) {
    const cheapest = data.reduce((a, b) =>
      b.Unit_Price < a.Unit_Price ? b : a
    );

    return res.json({
      answer: `The cheapest product is ${cheapest.Product_Name} priced at ₹${cheapest.Unit_Price}.`,
    });
  }

  /* ---------------- MOST EXPENSIVE PRODUCT ---------------- */
  if (
    question.includes("expensive") ||
    question.includes("costliest")
  ) {
    const expensive = data.reduce((a, b) =>
      b.Unit_Price > a.Unit_Price ? b : a
    );

    return res.json({
      answer: `The most expensive product is ${expensive.Product_Name} priced at ₹${expensive.Unit_Price}.`,
    });
  }

  /* ---------------- HIGHEST SALES DATE ---------------- */
 if (
  question.includes("most sold") ||
  question.includes("sells the most") ||
  question.includes("most sales") ||
  question.includes("highest sales") ||
  question.includes("maximum sales")
) {
  const productSales = {};

  data.forEach(d => {
    productSales[d.Product_Name] =
      (productSales[d.Product_Name] || 0) + d.Total_Sales;
  });

  const topProduct = Object.entries(productSales).reduce((a, b) =>
    b[1] > a[1] ? b : a
  );

  return res.json({
    answer: `The product with the highest sales is ${topProduct[0]} with total sales of ₹${topProduct[1]}.`,
  });
}

 if (question.includes("average sale")) {
  const totalSales = data.reduce((sum, d) => sum + d.Total_Sales, 0);
  const avgSale = (totalSales / data.length).toFixed(2);

  return res.json({
    answer: `The average sale value is ₹${avgSale}.`,
  });
}
if (
  question.includes("total sales of each product") ||
  question.includes("sales of each product")
) {
  const productSales = {};

  data.forEach(d => {
    productSales[d.Product_Name] =
      (productSales[d.Product_Name] || 0) + d.Total_Sales;
  });

  let response = "Here are the total sales of each product:\n";
  for (let product in productSales) {
    response += `${product}: ₹${productSales[product]}\n`;
  }

  return res.json({ answer: response });
}
if (
  question.includes("how many products") ||
  question.includes("total products") ||
  question.includes("total number of products") ||
  question.includes("number of products") ||
  question.includes("products available")
) {
  const uniqueProducts = new Set(data.map(d => d.Product_Name));
  return res.json({
    answer: `There are ${uniqueProducts.size} products available in total.`,
  });
}
// ---------------- PRODUCT COMPARISON ----------------
if (
  question.includes("compare") ||
  question.includes("vs")
) {
  // simple extraction for "pen" and "pencil"
  const products = ["pen", "pencil"];

  const found = products.filter(p => question.includes(p));

  if (found.length === 2) {
    const [p1, p2] = found;

    const sales1 = data
      .filter(d => d.Product_Name.toLowerCase() === p1)
      .reduce((sum, d) => sum + d.Total_Sales, 0);

    const sales2 = data
      .filter(d => d.Product_Name.toLowerCase() === p2)
      .reduce((sum, d) => sum + d.Total_Sales, 0);

    let result = "";
    if (sales1 > sales2) {
      result = `${p1} sells more than ${p2}.`;
    } else if (sales2 > sales1) {
      result = `${p2} sells more than ${p1}.`;
    } else {
      result = `${p1} and ${p2} have equal sales.`;
    }

    return res.json({
      answer: `Comparison result:\n${p1}: ₹${sales1}\n${p2}: ₹${sales2}\n👉 ${result}`,
    });
  }
}


  /* ---------------- FALLBACK ---------------- */
 return res.json({
  answer: 
    "I'm designed to answer questions about the retail shop, product sales, pricing, and dates 📊. Please ask something related to sales insights.",
});
});


// Start server
app.listen(5000, () => {
  console.log("✅ Chatbot backend running at http://localhost:5000");
});
