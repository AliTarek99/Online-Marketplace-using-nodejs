<h1>Online Marketplace</h1>
This is an online marketplace made using nodeJS and expressJS framework. This is my first project using nodeJS which I made while completing Maximilian Schwarzmuller's nodeJs course. This web app allows users to login, register, see details of the products, add products to cart, sell their products, pay using a visa, and generate PDF invoices of their orders.

<h2>Some details about the project:</h2>

* I used MongoDB with Mongoose for the database.
* There was a data consistency problem when adding products to the cart quickly due to different requests trying to modify the cart at the same time so I implemented pessimistic lock on the user records.
* When processing payments and collecting shipment data I used Stripe API.
* There are verification and password reset emails that are sent using Mailjet API.
* If the user account is not verified he will not be able to add products to cart or sell products.
* I used the middleware validation functions in express-validator and added some custom validation.

Note: all the API keys were changed so the project will not work with these keys.

<h2>Overview of the project:</h2>

<h3>Login and Registeration</h3>

* This image shows the validation on input in the login page

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/17b76006-c2f7-4d62-b3bd-71cad3302b5d)
* This image shows the validation in the register page

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/515999d7-850d-429b-9687-bed371829d5e)
<h3>Adding Products</h3>

* This is the page where you can add your products and edit them

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/fd129f34-7eb3-42c7-aad5-0b9ab3ae1150)
* These are the products you are selling
* you can choose to delete or edit them

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/ef34f040-d24c-493f-bead-4a7dedbf7378)
* This is the home page where you can add products to cart or see their details

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/4d0d9d19-ca25-449b-9840-25c1d9ee2539)
<h3>Cart</h3>

* This is the cart page where you can set the quantity or remove the item from the cart

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/a95bbf57-d742-4cb3-9de2-cd63e4169df7)
<h3>Orders</h3>

* This is the orders page where you can see your purchase history

![image](https://github.com/AliTarek99/Online-Marketplace-using-nodejs/assets/120846112/0cbc04f7-329d-4650-b244-56047e4ff8d4)

