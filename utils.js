const splitAddress = (address) => {
  if (address.includes(",")) {
    
    const addressArr = address.split(',')
    const street = addressArr[0].trim()
    const ortArr = addressArr[1].trim().split(" ")
    const postalCode = ortArr[0].trim();
    const ort = ortArr[1].trim();
    return { street , postalCode , ort}
  }
  return {street: address, postalCode:"", ort:""}
};
module.exports ={splitAddress} 