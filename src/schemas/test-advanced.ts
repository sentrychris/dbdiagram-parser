export default `
Table ecommerce.merchants {
  id int
  country_code int
  merchant_name varchar
  created_at varchar
  admin_id int
}

Table users {
  id int [pk, increment]
  full_name varchar
  created_at timestamp
  country_code int
}

Table countries {
  code int [pk]
  name varchar
  continent_name varchar
 }

Table ecommerce.order_items {
  order_id int [ref: > ecommerce.orders.id]
  product_id int
  quantity int
}

Table ecommerce.orders {
  id int [pk]
  user_id int [not null, unique]
  status varchar
  created_at varchar [note: 'When order created']
}

Table ecommerce.products {
  id int [pk]
  name varchar
  merchant_id int [not null]
  price int
  created_at datetime
}

Table ecommerce.product_tags {
  id int [pk]
  name varchar
}

Table ecommerce.merchant_periods {
  id int [pk]
  merchant_id int
  country_code int
  start_date datetime
  end_date datetime
}
`;