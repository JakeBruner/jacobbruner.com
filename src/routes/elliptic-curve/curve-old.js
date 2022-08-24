//TODO maybe make the point, instead of an array, a point class with various properties to make my life easier

const start = Date.now()
//javascript is weird... since something like -2 % 5 returns -2, i have to define this crap
// note that i call my mod() function when the output of something may be negative
// --> if something is positive definite i just use a % n
const mod = (a, n) => {
    return ((a % n) + n) % n;
};
//i also have to implement the euclediean algorithm to handle multiplicitive inverses in the finite field
// TODO maybe store already computed values in memory becuase it often computes it multiple times
const inverse = (a, n) => { // euclidean algorithm
    [a, m] = [Number(a), Number(n)];
    if (Number.isNaN(a) || Number.isNaN(n)) {
        return NaN; //invalid input
    }
    a = mod(a, n);
    if (!a || m < 2) {
        return NaN; // invalid input
    }
    // find the gcd
    const s = []
    let b = n
    while (b) { // b is truthy until 0
        [a, b] = [b, a % b]
        s.push({
            a,
            b
        })
    }
    if (a !== 1) {
        throw new Error(`no inverse of ${a} mod ${n}`) // inverse does not exist
    }
    // find the inverse
    let x = 1;
    let y = 0;
    for (let i = s.length - 2; i >= 0; --i) {
        [x, y] = [y, x - y * Math.floor(s[i].a / s[i].b)]
    }
    return mod(y, n);
}
/*  //let stepcount = 0;

    while (nr !== 0) {
        
        let quotient = Math.floor(r/nr);

        t = nt; 
        nt = t - quotient * nt;

        nr = r - quotient * nr;
        r = nr;
       
        //stepcount++;
        // console.log(`number of interations for ${a}^-1 mod ${p}: ${stepcount}`)
    }
    if (r > 1) {
       throw new Error(`no inverse of ${a}`);
    } 
    if (t < 0) {
        t += n;
        
    }
    return t;
}
// console.log("log inverse " + inverse(2,5))
*/

E = [
    [Infinity, Infinity]
]; // set of points over field Fp with its identity element
p = 13;
// in form y^2 = x^3 + ax + b
a = 4;
b = 9;



for (let j = 0; j < p; j++) { // test for solutions within the field
    for (let i = 0; i < p; i++) {
        if ((i ** 2) % p === (j ** 3 + a * j + b) % p) {
            E.push([j, i]); // append to set
        };
    };
};
console.log("————————————————————————————————————————————————————————————————————————————————————————————————");
console.log(`Elliptic curve y^2 = x^3 + ${a}x + ${b} defined over \u1d53d ${p} (ℤ/${p}ℤ) with order ${E.length} \n`)
console.log('The k-rational points are:');
console.log(E)
//console.log("indexing into " + E[1])

const groupAction = ([Xq, Yq], [Xp, Yp]) => {
    if (Xq == Infinity) { // if Q is identity
        return [Xp, Yp]
    }
    if (Xp == Infinity) { // if P is identity
        return [Xq, Yq]
    }

    let m; // slope of secant

    if (Xp == Xq) { // either P and Q are opposite eachother or they're the same point

        if (Yp == mod(-Yq, p)) { // if their y-coordinates are inverses (refl across y-axis)

            return [Infinity, Infinity]; // return the identity point

        } else { // otherwise, they must be exactly equivalant 

            // given that P = Q, their addition is defined as the tangent to the curve
            m = mod((3 * (Xp ** 2) + a) * inverse(2 * Yp, p), p); // from implicit differentiation

        }
    } else { // this is the normal case; P =/= Q,  y_p =/= -y_q mod p

        m = mod((Yp - Yq) * inverse(Xp - Xq, p), p); // normal slope formula

    };
    
    let Xr = mod((m ** 2 - Xp - Xq), p); // x value of output
    let Yr = mod(-(Yq + m * (Xr - Xq)), p); // y value of output (negative value because reflected on x-axis)

    return [Xr, Yr];
};

const repeatedAction = ([a, b], times) => { // sexy little self-referential algorithm here
    if (times === 1) {
        return [a, b]
    } else if (times > 1) {
        return groupAction([a, b], repeatedAction([a, b], times - 1));
    }
    while (times === 0) {
        throw new Error("how did we get here?")
    }
}
// console.log(repeatedAction(E[4], 2));

//console.log(groupAction(E[0], E[4]))

var test = [];
for (let i = 0; i < E.length; i++) { // there might be a better way to do this
    test.push([])
}

for (let col = 0; col < E.length; col++) {
    for (let row = 0; row < E.length; row++) {
        test[col].push(groupAction(E[row], E[col])); //index thru every element of the group and append their composition to a table
    };
};

/* test.forEach(element => {
    element.forEach((element) =>{
        if (element[0] === Infinity) {return ["Inf", "Inf"];};
    });
});  idk */
console.log('the Cayley table for the group of k-rational points under point addition:')
console.table(test);

let i = 1;

let subgroup = []
while (true) {
    subgroup.push(repeatedAction(E[1], i));
    //console.log(subgroup[subgroup.length-1]);
    if (subgroup[subgroup.length - 1][0] == Infinity) {
        break
    };
    i++;
}
console.log(`Subgroup of order ${subgroup.length} generated from ${E[1]}:`);
subgroup.forEach(element => console.log(element));


/*const intersect = (arrA, arrB)=> {
    // let intersection = arrA.filter(value => arrB.forEach(valueB => {return JSON.stringify(value) == JSON.stringify(valueB)}));
    let intersection = arrA.filter(valueA => { // if callbackfn returns true, it appends to array
        arrB.every(valueB => { // loops thru every value and returns boolean based on condition
            JSON.stringify(valueA) != JSON.stringify(valueB) //if the stringified element of ArrA is within ArrB, this callbackfn returns true
        })
        console.log(JSON.stringify(valueA));
        console.log(JSON.stringify(valueB));
        
        console.log( arrB.every(valueB => { // loops thru every value and returns boolean based on condition
            JSON.stringify(valueA) !== JSON.stringify(valueB) //if the stringified element of ArrA is within ArrB, this callbackfn returns true
        }));
    });

    console.log( E.every(valueB => JSON.stringify(subgroup[1]) == JSON.stringify(valueB)) );
    return intersection;

}*/
//console.log(E.filter(value => subgroup.includes(value)))
deleteme = [];


console.log("intersection");
//const subgroup2 = intersect(E, subgroup)
//console.log(subgroup2);
console.log(E.includes([0, 3]));
//console.log(  subgroup.filter(valueA => E.every(valueB => JSON.stringify(valueA) == JSON.stringify(valueB)));  );
// console.log("sdfkhsf");
//console.log(E);
//console.log(subgroup);



if (subgroup.length == E.length) {
    console.log("elliptic curve is cyclic and thus isomorphic to the additive group of the finite field");
    console.log("TRIVIAL :p")
} else {

    console.log(`there exist more subgroups of order at most ${E.length - subgroup.length}`);
}


const time = Date.now() - start
console.log(`this took ${time}ms to run`);

console.log("————————————————————————————————————————————————————————————————————————————————————————————————");
// Q.E.D.


//aliceSK = E[5]


//console.log(groupAction(aliceSK, bobPK));
//console.log(groupAction(bobSK, alicePK))