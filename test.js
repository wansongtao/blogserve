const tree = [
    {id: 1, pid: 0},
    {id: 2, pid: 0},
    {id: 3, pid: 0},
    {id: 4, pid: 2},
    {id: 5, pid: 2},
    {id: 6, pid: 4},
    {id: 7, pid: 4},
    {id: 8, pid: 6},
    {id: 9, pid: 6},
    {id: 10, pid: 4}
]

function convertTree(list, pid = 0) {
    const arr = [];

    for(let i = 0; i < list.length; i++) {
        if (list[i].pid === pid) {
    
            const children = convertTree(list, list[i].id);

            if (children) {
                list[i].children = children;
            }

            let val = list.splice(i--, 1)[0];
            arr.push(val);
        }
    }

    return arr;
}

function convertTreeTwo(list, pid = 0) {
    let arr = [];

    list.forEach(item => {
        if (item.pid === pid) {
            const children = convertTreeTwo(list, item.id);

            if (children) {
                item.children = children;
            }

            arr.push(item);
        }
    });

    return arr;
}


function testTime(count = 99999, fn = convertTree) {
    console.time();

    for(let i = 0; i < count; i++) {
        fn(tree);
    }

    console.timeEnd();
}

testTime();
// console.log(convertTreeTwo(tree)[1]);

// console.log(convertTree(tree)['1']);

// console.log(convertTree(tree)[1].children[0]);