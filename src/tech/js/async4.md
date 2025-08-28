---
title: 异步编程：Promise 状态吸收
date: 2025-08-19
tags:
  - 异步编程
---
# 异步编程：Promise 状态吸收

```js
/*
    Promise 状态吸收的发生场景 , p 是一个 promise 实例
    - new Promise((resolve)=> resolve(p))
    - async function(){ return p }
    - then中
*/

// @1： Promise.resolve()，如果参数是一个 Promise，那它会把这个 promise 直接返回, 不会！吸收
{
    const p1 = Promise.resolve('1')
    const p2 = Promise.resolve(p1)

    const p3 = new Promise((resolve) => { resolve(p1) }) // 状态吸收

    // p2 直接返回 p1 ； p3 状态吸收 p1
    console.log(p1, p2, p1 === p2) // Promise { '1' } Promise { '1' } true
    console.log(p3, p1, p3 === p1) // Promise { <pending> } Promise { '1' } false
}


// @2： 当 async 函数的返回值本身是一个 promise 的时候，也会发生状态吸收
{
    const test = Promise.resolve('1')
    async function foo1() {
        return test
    }
    function foo2() {
        return test
    }
    const res = foo1() // 发生了状态吸收
    console.log(test, res, res === test) // Promise { '1' } Promise { <pending> } false
    const res2 = foo2() // 直接返回
    console.log(test, res2, res2 === test) // Promise { '1' } Promise { '1' } true
}


// @3： 当.then 的返回值是一个 promise 时
{
    // 先看下面的例子，then 总是返回普通值，显然，打印出 1,a,2,b,3,c
    // Promise.resolve(1).then((res1) => {
    //     console.log(res1)
    //     return 2
    // }).then((res2) => {
    //     console.log(res2)
    //     return 3
    // })
    // Promise.resolve('a').then((res1) => {
    //     console.log(res1)
    //     return 'b'
    // }).then((res2) => {
    //     console.log(res2)
    //     return 'c'
    // })

    const A = Promise.resolve(1)
        .then((res1) => {
            // .then(async (res1) => {
            console.log(res1)
            return Promise.resolve(2)
            // return 2
        }).then((res2) => {
            console.log(res2)
            return 3
        }).then((res3) => {
            console.log(res3)
            return 4
        }).then((res4) => {
            console.log(res4)
        })
    const B = Promise.resolve('a').then((res1) => {
        console.log(res1)
        return 'b'
    }).then((res2) => {
        console.log(res2)
        return 'c'
    }).then((res3) => {
        console.log(res3)
        return 'd'
    }).then((res4) => {
        console.log(res4)
        return 'e'
    })
    // .then((res) => {
    //     console.log(res)
    // })
    /*
    当我们把第一个then的返回值改为resolve(2)时，输出顺序变为了 1 a b c 2 d 3 4
    分析一下：
    [A1, B1] --> [ 1,等待状态吸收2,    'a',fulfilled'b'  ]
    [A1, B2] --> 打印 1，a , [准备2, 'b',fulfilled'c']
    [A1, B3] --> 打印 b, [吸收2, 'c'fulfilled'd']
    [A1, B4] --> 打印 c, [2,fulfilled3   , 'd'fulfilled'undefined']
    [A2]     --> 打印 2, d, [3,fulfilled4]
    [A3]     --> 打印 3 , [4]
    [A4]     --> 打印 4
    
    最终顺序： 1,a,b,c,2,d,3,4
    
    难理解的地方在于，第一个 then 里面的 2，在一次 tick 之后，也就是它被执行时才开始状态吸收过程。
    从他开始执行，开始状态吸收时，wait 2 step 就对了。
    */

    /*
    当我们再把返回 promise 的 then的回调声明为 async 时，这时候就是两次状态吸收，
    打印为 1 abcd 234 也就是 wait 4 step
    */
}

// 案例
{
    async function foo() {
        console.log(1)
        // await bar()
        await bar2()
        console.log('AAA')
    }
    async function bar() {
        return Promise.resolve(2)
    }
    function bar2() {
        return Promise.resolve(2)
    }
    foo()

    Promise.resolve()
        .then(() => {
            console.log('a')
        })
        .then(() => {
            console.log('b')
        })
        .then(() => {
            console.log('c')
        })

    // $1：调用 bar 的话
    // 打印 1  [ bar准备, 'a' ]
    // 打印'a' [ bar吸收, 'b' ]
    // 打印'b' [  'AAA', 'c' ]
    // 1 a b AAA c

    // $2: 调用 bar2 的话
    // 打印 1 ['AAA', 'a']
    // 打印 'AAA' 'a' ['b']
    // 打印 'b' ['c']
    // 打印 'c'
    // 1 AAA a b c
}
```