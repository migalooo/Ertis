import {name, count} from './t' 

let b: number = count 

b++

let str: string = `hello ${name} ${b}`

interface Person {
    name: string
    age?: number
}



let mySum = function (x, y): number {
  return x + y
}

let age: number = mySum(2, 4)

let tom: Person = {
  name,
  age: age 
}

export default  tom 
