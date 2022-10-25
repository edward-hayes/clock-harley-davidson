// change the href for an element
export function setImage(imageName, element) {
  element.image = `${imageName}.png`;
}

// set number images for corresponding elements
export function setNumber(number, elements) {
  let number = number;
  const strArray = String(number).split("");
  for (let idx=0; idx < elements.length; idx++) {
    if(strArray[idx] !== undefined ) {
      setImage(strArray[idx],elements[idx]);
    }
    else {
      makeBlank(elements[idx]);
    }
  }
}


function makeBlank(element) {
  setImage("blank",element);
}

export function zeroPad(num) {
  if (num < 10) {
    num = "0" + num;
  }
  return num;
  
}