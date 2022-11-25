import * as document from "document";
import * as util from "./utils.js";
import clock from "clock";
import { battery } from 'power';
import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { display } from "display";
import { today } from "user-activity";


// battery elements
let batteryIcon = document.getElementById("battery-icon");
let elementsBat = document.getElementsByClassName("batt");

// clock elements
let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let elementsMinTick = document.getElementsByClassName("min-tick");
let elementsMinorTick = document.getElementsByClassName("minor-tick");
let elementsMajorTick = document.getElementsByClassName("major-tick");
var minTickArr = []
var minorTickArr = []
makeTickArrs();

// date elements
let elementsDate = document.getElementsByClassName("date");
let mon = document.getElementById("mon");


// sensor elements
let elementsHR = document.getElementsByClassName("hr");
let elementsSteps = document.getElementsByClassName("step");
let elementsCal = document.getElementsByClassName("cal");

// Update Heart Rate Monitor
if (HeartRateSensor) {
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
  updateHR(hrm.heartRate,elementsHR);
  });
  hrm.start();

  // Stop Heart Rate Monitor if Not on Wrist
  if (BodyPresenceSensor) {
    const body = new BodyPresenceSensor();
    body.addEventListener("reading", () => {
      if (!body.present) {
        hrm.stop();
        util.setNumber('',elementsHR);
      } else {
        hrm.start();
      }
    });
    body.start();
  }
  
  // Stop Heart Rate Monitor When Display is Off
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? hrm.start() : hrm.stop();
  });
  hrm.start();
}

// Update Clock, Battery, Steps, Cal
clock.granularity = "minutes";
clock.ontick = (evt) => {
  let date = new Date();
  let hours = date.getHours() % 12;
  let mins = date.getMinutes();
  
  // sets month and date digit images
  setDate(date);
  
  // set position of watch hands
  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  
  // set the battery icon & battery percentage
  updateBatLevel();

  // reset all ticks so prev mintick is reset to white
  resetTicks(elementsMinTick);
  resetTicks(elementsMinorTick);
  resetTicks(elementsMajorTick);
  
  // set current tick red
  updateTick(mins);
  
  // set steps
  util.setNumber(today.adjusted.steps,elementsSteps);
  
  // set calories
  updateCal(today.adjusted.calories,elementsCal);
}

// sets the calorie digit images
function updateCal(calories,elementsCal) {
  var calArray = String(calories).split("")
  while (calArray.length < 5) {
    calArray.unshift("blank")
  }
  for (let idx=0; idx < elementsCal.length; idx++) {
    util.setImage(calArray[idx],elementsCal[idx]);
  }
}

// sets the heart rate digit images
function updateHR(heartRate,elementsHR) {
  var hrArray = String(heartRate).split("")
  while (hrArray.length < 3) {
    hrArray.unshift("blank")
  }
  for (let idx=0; idx < elementsHR.length; idx++) {
    util.setImage(hrArray[idx],elementsHR[idx]);
  }
}

// sets the correct 'month' image and the correct date images
function setDate(date) {
  let month = date.getMonth();
  let date = date.getDate();
  util.setImage(`mon_${month}`, mon);
  updateDateElem(date,elementsDate);
  
}

// sets date images, if date is a sigle digit removes blank
function updateDateElem(date,elementsDate) {
  var dateArray = String(date).split("");
  while (dateArray.length < 2) {
    dateArray.unshift("blank")
  }
  for (let idx=0; idx < elementsDate.length; idx++) {
    util.setImage(dateArray[idx],elementsDate[idx]);
  }
}

function updateBatLevel() {
  let batLevel = battery.chargeLevel;
  // update batt icon
  if (batLevel == 100) {util.setImage('battery_full',batteryIcon);} else
  if (batLevel >= 80) {util.setImage('battery_80',batteryIcon);} else
  if (batLevel >= 60) {util.setImage('battery_60',batteryIcon);} else
  if (batLevel >= 40) {util.setImage('battery_40',batteryIcon);} else
  if (batLevel >= 20) {util.setImage('battery_20',batteryIcon);} else
  if (batLevel < 20) {util.setImage('battery_low',batteryIcon);}
  
  // update batt percentage
  let batPercentage = util.zeroPad(batLevel) +'%';
  util.setNumber(batPercentage,elementsBat);
}

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return 180 + hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return 180 + (360 / 60) * minutes;
}

// sets all ticks to white
function resetTicks(elements) {
  for (let idx=0; idx < elements.length; idx++) {
    elements[idx].style.opacity =.6;
    elements[idx].style.fill = "white";
    elements[idx].width = 1;
  }
};

// identifies the tick that corresponds to the current min
function updateTick(min) {
  if (min == 0) {
    setCurrentTick(elementsMajorTick[0]); 
  } else if (min % 15 == 0) { 
    let idx = min / 15;
    setCurrentTick(elementsMajorTick[idx]);
  } else if (min % 5 == 0 ) { 
    let idx = minorTickArr.indexOf(min)
    setCurrentTick(elementsMinorTick[idx]);
  } else {    
    let idx = minTickArr.indexOf(min);
    setCurrentTick(elementsMinTick[idx]);
  }
}

// Tick Arrs maps minute value to element position
function makeTickArrs() {
  for (let idx = 1; idx < 60; idx++) {
    switch(idx % 5) {
      case 0:
        switch(idx % 15) {
          case 0:
            break;
          default:
            minorTickArr.push(idx)
        }
        break;
      default:
        minTickArr.push(idx);
    }
  } 
}

// sets a tick element to orange
function setCurrentTick(element) {
  element.style.opacity = 1;
  element.style.fill = "orangered";
  element.width = 3;
}



