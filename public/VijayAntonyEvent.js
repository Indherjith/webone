// Select elements
const subtractButton = document.getElementById("subtractTicket");
const addButton = document.getElementById("addTicket");
const ticketCountDisplay = document.getElementById("ticketCount");
const ticketTotalAmountDisplay = document.getElementById("ticketTotalAmount");
const finalTotalAmount = document.getElementById('charges1');

// Initialize ticket count and price
let ticketCount = 0;
const ticketPrice = 350; // Adjust the ticket price as needed

// Function to update total amount
function updateTotalAmount() {
    const totalAmount = ticketCount * ticketPrice;
    ticketTotalAmountDisplay.textContent = `₹${totalAmount}`;
    finalTotalAmount.textContent = `₹${totalAmount}`}

// Event listener for subtract button
subtractButton.addEventListener("click", () => {
    if (ticketCount > 0) {
        ticketCount--;
        ticketCountDisplay.textContent = ticketCount;
        updateTotalAmount();
    }
});

// Event listener for add button
addButton.addEventListener("click", () => {
    if (ticketCount < 500) { // Adjust the maximum ticket count as needed
        ticketCount++;
        ticketCountDisplay.textContent = ticketCount;
        updateTotalAmount();
    }
});

// Initial update of total amount
updateTotalAmount();


// Payment Handler

const buynow = document.getElementById("btn");
var Buyer_Details = JSON.parse(localStorage.getItem("user"));
var event_Details={
    image : "",
    name : "",
    description : "",
    venue : ""
  }

buynow.addEventListener("click",(event)=>{
    event.preventDefault();
    if(ticketCount==0){
        alert("Please Add Ticket Count First!");
        return 0 ;
    }
    document.getElementsByClassName("container")[0].style.opacity = "0.3";
    event_Details.image = "https://res.cloudinary.com/dwzmsvp7f/image/fetch/q_75,f_auto,w_1316/https://media.insider.in/image/upload/c_crop%2Cg_custom/v1709292724/an2lhsubgu7junkj4tp4.jpg";
    event_Details.name = "Vijay Antony Concert Chennai 2024";
    event_Details.description = "Experience the magic of Vijay Antony at his spectacular 2024 Chennai concert!";
    event_Details.venue = "Chepak Stadium, Chennai. 12th Aug 2024."
    let amount = finalTotalAmount.textContent.split("");
    amount.shift();
    var Ticketcost = Number(amount.join(""));
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        amount: Ticketcost,
        currency: "INR"
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };
    fetch("/order", requestOptions)
    .then((response) => response.json())
    .then((result) => {
        const order = result;
        // console.log(order);
        var options = {
            "key": "rzp_test_BmC3n46u38WUe6", 
            "amount": order.amount, 
            "currency": "INR",
            "name":event_Details.name , 
            "description": event_Details.description,
            "image": event_Details.image,
            "order_id": order.id, 
            "handler": function (response){
              let body = {
                "total_amount":Ticketcost,
                "razorpay_payment_id":response.razorpay_payment_id,
                "razorpay_order_id" : response.razorpay_order_id,
                "razorpay_signature": response.razorpay_signature,
                Buyer_Details,
                event_Details,
                ticketCount:Ticketcost/ticketPrice,
                ticketPrice
              }
              const callbackHeaders = new Headers();
              callbackHeaders.append("Content-Type", "application/json");
              const callbackraw = JSON.stringify({...body});
              const callbackrequestOptions = {
                method: "POST",
                headers: callbackHeaders,
                body: callbackraw
              };
              fetch("/order/validate",callbackrequestOptions)
              .then((result)=>{
                window.location=result.url
                console.log(result)
              })
              .catch(err=>{
                console.log(err);
              })
          },
            "prefill": { 
                "name":Buyer_Details.username ,
                "email": Buyer_Details.email,
                "contact": Buyer_Details.phone
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }
        };
              var rzp1 = new window.Razorpay(options);
              ('payment.failed', function (response){
                      alert(response.error.code);
                      alert(response.error.description);
                      alert(response.error.source);
                      alert(response.error.step);
                      alert(response.error.reason);
                      alert(response.error.metadata.order_id);
                      alert(response.error.metadata.payment_id);
              });
              rzp1.open();
              ticketCount = 0;
              ticketCountDisplay.textContent = ticketCount;
              updateTotalAmount();
      })
      .catch((error) => console.error(error));
})