export const productsErrorIncompleteValue = (product) => {

    return "One or more required parameters were not provided:\n" +
      "Required properties:\n" +
      `*  title: A defined string was expected, but received ${product.title}.\n` +
      `*  description: A defined string was expected, but received ${product.description}.\n` +
      `*  code: A defined string was expected, but received ${product.code}.\n` +
      `*  price: A defined string was expected, but received ${product.price}.\n` +
      `*  stock: A defined string was expected, but received ${product.stock}.\n` +
      `*  category: A defined string was expected, but received ${product.category}.\n`;
      
  };
  
  export const productsInvalidValue = (product) => {

    return "One or more required parameters are invalid values:\n" +
      `The ${product.pid} is not a valid product id\n`

  };


