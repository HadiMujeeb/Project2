// // 1 install nodemailer
// // 2. import nodemailer
// const nodemailer = require("nodemailer");
// require("dotenv").config() 

// // 3. cofigure mail and send it

// async function sendMail() {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "hadimujeeb300@gmail.com",
//       pass: "ogovpoenykqxjwqt",
//     },
//   });


//   const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//         console.log('email:', process.env.email);
//         console.log('from:', process.env.AUTH_MAIL);
//   // 2.configure email content.

//   const mailOptions = {
//     from: "hadimujeeb300@gmail.com",
//     to: "hadimujeeb705@gmail.com",
//     subject: "Welcome to node JS App",
//     text: "this is an email using nodemail in node.js",
//     html: `<p>Enter <b> ${otp} </b> in the app to verify your email address </p>`
//   };

//   // 3. send email

//   try {
//     const result = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully");
//   } catch (error) {
//     console.log("Email send failed with error :", error);
//   }
// }

// sendMail()






{/* <table class="table table-hover">
<thead>
    <tr>
        <th>N0s</th>
        <th scope="col">Name</th>
        <th scope="col">Email</th>
        <th scope="col">Mobile</th>
        <th scope="col">Status</th>
        <!-- <th scope="col">Date</th> -->
        <th scope="col" class="text-end">Action</th>
    </tr>
</thead>
<tbody>

    <% if(users.length> 0 ){%>

        <% for( let i=0 ; i < users.length ; i++){ %>




            <tr>
                <td>
                    <%= i+1%>
                </td>
                <td><b>
                        <%= users[i].name%>
                    </b></td>
                <td>
                    <%= users[i].email%>
                </td>
                <td>
                    <%= users[i].mobile%>
                </td>

                <td class="text">
                    <!-- <span id="Status<%= users[i]._id %>"> -->
                        <% if (users[i].isBlocked==false) { %>
                            <span class="badge rounded-pill alert-warning">Inactive</span>
                            <% } else { %>
                                <span class="badge rounded-pill alert-success">Active</span>
                                <% } %>

                </td>


                <td class="text-end">

                    <% if (users[i].isBlocked==false) { %>
                        <a href="/unblock?id=<%=users[i]._id %>"
                            class="btn btn-md rounded font-sm ">
                            Unblock
                        </a>


                        <% } else { %>
                            <a href="/block?id=<%=users[i]._id %>"
                                class="btn btn-md rounded font-sm"
                                style="background-color: red;">
                                block
                            </a>
                                <% } %>
                                   
                </td>
            </tr>

            <% } %>
                <% }else{%>

                    <tr>
                        <td colspan="5">Users Not Found</td>
                    </tr>
                    <% } %>

</tbody>
</table>
<script>
function confirmAction(userId, actionType, index) {
  const actionText = actionType === 0 ? 'Block' : 'Unblock';
  const confirmation = window.confirm(`Are you sure you want to ${actionText} this user?`);

  if (confirmation) {
    window.location.href = `/admin/block?id=${userId}&action=${actionType}`;
  }
}
</script> */}


