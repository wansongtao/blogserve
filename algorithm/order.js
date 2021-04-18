/**
 * @description 测试算法速度
 * @param {Function} fn 算法函数
 * @param {number} testCount 测试次数 10
 * @param {number} randomNumberCount 生成的随机数数量 100000
 */
function test(fn, testCount = 10, randomNumberCount = 100000) {
    console.time(`测试的算法是${fn.name}，测试次数${testCount}次，排序${randomNumberCount}个数字，共耗时`);
    for (let loop = 0; loop < testCount; loop++) {
        let randomNumberArr = [];

        for (let numCount = 0; numCount < randomNumberCount; numCount++) {
            let randomNum = Math.ceil(Math.random() * randomNumberCount + 1);

            randomNumberArr.push(randomNum);
        }

        fn(randomNumberArr);
    }
    console.timeEnd(`测试的算法是${fn.name}，测试次数${testCount}次，排序${randomNumberCount}个数字，共耗时`);
}

/**
 * @description 测试算法是否正确
 * @param {function} fn 
 */
function testAlgorithm(fn) {
    let randomNumberArr = [];

    for (let numCount = 0; numCount < 20; numCount++) {
        let randomNum = Math.ceil(Math.random() * 1000 + 1);

        randomNumberArr.push(randomNum);
    }

    console.log(fn(randomNumberArr));
}

/**
 * @description 冒泡排序
 * @param {array} arr 待排序数组
 * @returns {Array} 返回排序后的数组
 */
function bubbleSort(arr = [100, 50, 3, 23, 0, 10]) {
    // 重复以下步骤。注意：找出十个数里最大的一个数最多只需要进行9次比较 => arr.length - 1。
    for (let loop = 0; loop < arr.length - 1; loop++) {
        /**
         * [100, 50, 3, 23, 0, 10] => [50, 3, 23, 0, 10, 100] (下一次比较‘100’已经不用参与了)
         * 对每一对相邻的元素作比较。比较完数组中所有元素后，可以找到一个最大的元素。
         * 因为每比较完一次数组，都可以找出一个最大值，所以比较次数逐次递减。
         */
        for (let i = 0; i < arr.length - 1 - loop; i++) {
            // 比较相邻的两个元素，如果第一个元素比第二个大，就交换它们的位置。
            if (arr[i] > arr[i + 1]) {
                // es6新语法，对象解构，交换位置
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
            }
        }
    }

    return arr;
}

/**
 * @description 选择排序
 * @param {array} arr 待排序数组
 * @returns {Array} 返回排序好的数组
 */
function selectionSort (arr = [55, 0, 3, 98, 12, 4]) {
    for (let i = 0; i < arr.length - 1; i++) {
        // 假设当前i为最小值的索引
        let minIndex = i;

        /**
         * 寻找数组中是否还有比arr[i]小的值
         * 因为外部for循环每循环一次都可以找到一个最小的值。
         * 所以内部for循环循环次数逐次递减 => j = i + 1
         */
        for (let j = i + 1; j < arr.length; j++) {
            // 有比arr[i]还小的值则保存其索引
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        // 使用es6新语法对象解构，交换值。
        // 相当于： let temp = arr[i] arr[i] = arr[minIndex] arr[minIndex] = temp
        [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }

    return arr;
}

/**
 * @description 基数排序
 * @param {array} arr 待排序数组
 * @returns {Array} 返回排序好的数组
 */
function radixSort (arr = [10, 0, 41, 30, 31, 21]) {
    let tempArr = [];
    
    //先按个位数大小排序，例如：tempArr[0] = [10, 0, 30] tempArr[1] = [41, 21, 31]
    arr.forEach(item => {
        // 判断该数组是否已创建
        if (tempArr[item % 10] === undefined) {
            tempArr[item % 10] = [];
        }

        tempArr[item % 10].push(item);
    });
    // tempArr = [[10, 0, 30], [41, 31, 21]]

    //再按除以十的大小排序
    let newArr = [];
    tempArr.forEach(item => {
        if (item !== undefined) {
            item.forEach(val => {
                // 例如：newArr[1] = [10] newArr[2] = [21]
                let temp = Math.floor(val / 10);
                if (newArr[temp] === undefined) {
                    newArr[temp] = [];
                }
    
                newArr[temp].push(val);
            });
        }
    });
    // newArr = [[0], [10], [21], [30, 31], [41]]

    // 将排好序的二维数组合并为一维数组
    tempArr = [];
    newArr.forEach(item => {
        tempArr.push(...item);
    });
    
    return tempArr;
}

/**
 * @description 插入排序
 * @param {array} arr 待排序数组
 * @returns {Array} 返回排序好的数组
 */
function insertionSort (arr = [10, 3, 12, 1, 23, 88, 39]) {
    for (let i = 0; i < arr.length; i++) {
        // 保存当前值
        let currentVal = arr[i];

        // 保存当前值的前一个数组元素的索引
        let preIndex = i - 1;

        // 将当前值currentVal与它前面的每一个值作比较
        while(preIndex >= 0 && arr[preIndex] > currentVal) {
            // 如果前一个值大于当前值则交换其位置，preIndex减一
            arr[preIndex + 1] = arr[preIndex];
            preIndex--;
        }

        // 因为当前值经过while循环后i可能并不是当前值的索引，所以使用preIndex+1最为适合
        arr[preIndex + 1] = currentVal;
    }
    
    return arr;
}

/**
 * @description 希尔排序
 * @param {array} arr 待排序数组
 * @returns {Array} 排序好的数组
 */
function shellSort (arr) {
    // 设置动态间隔
    let h = 1;
    while(h < arr.length / 3) {
        h = h * 3 + 1;
    }

    // 当h=1时等于插入排序
    while(h >= 1) {
        for (let i = h; i < arr.length; i++) {
            // 保存当前值
            let currentVal = arr[i];

            // 保存当前值的前h个值的索引
            let preIndex = i - h;

            // 将当前值currentVal与它前面的每h个值作比较
            while(preIndex >= 0 && arr[preIndex] > currentVal) {
                // 如果前一个值大于当前值则交换其位置，preIndex减h
                arr[preIndex + h] = arr[preIndex];
                preIndex -= h;
            }

            // 因为当前值经过while循环后i可能并不是当前值的索引，所以使用preIndex+h最为适合
            arr[preIndex + h] = currentVal;
        }

        // 间隔逐渐变小
        h = (h - 1) / 3;
    }

    return arr;
}

/**
 * @description 快速排序
 * @param {array} arr 待排序数组
 * @returns {Array} 返回排序好的数组
 */
function quickSort (arr) {
    // 当数组长度小于等于一时，直接返回
    if (arr.length <= 1) {
        return arr;
    }

    let lessArr = [],
    largeArr = [],
    pivot = arr.splice(0, 1);

    arr.forEach(item => {
        if (item > pivot[0]) {
            // 将大于基准值的元素放入largeArr数组
            largeArr.push(item);
        }
        else if (item < pivot[0]){
            // 将小于基准值的元素放入lessArr数组
            lessArr.push(item);
        }
        else {
            // 相等的直接放入pivot数组
            pivot.push(item);
        }
    });

    // 对lessArr和largeArr数组重复以上过程，最后将排序好的数组连接起来
    return quickSort(lessArr).concat(pivot, quickSort(largeArr));
}

/**
 * @description 归并排序
 * @param {array} arr 待排序数组
 * @returns {Array} 返回排序好的数组
 */
function mergeSort (arr) {
    if (arr.length <= 1) {
        return arr;
    }

    // 将数组分为两部分
    let middle = Math.floor(arr.length / 2),
    leftArr = arr.slice(0, middle),
    rightArr = arr.slice(middle);

    function merge (leftArr, rightArr) {
        let result = [];
    
        // 当两个数组的长度都大于0时，比较相同索引的数组元素大小，将小的放入result数组
        while(leftArr.length && rightArr.length) {
            if (leftArr[0] > rightArr[0]) {
                // shift()方法 => 移除数组开头的元素并返回
                result.push(rightArr.shift());
            }
            else {
                result.push(leftArr.shift());
            }
        }
    
        // 当只有一个数组的长度大于0时，直接将result和其合并
        if (leftArr.length) {
            result.push(...leftArr);
        }
        else if (rightArr.length) {
            result.push(...rightArr);
        }
    
        return result;
    }

    // mergeSort(leftArr) => 递归将其分割为不可分割的数组序列
    return merge(mergeSort(leftArr), mergeSort(rightArr));
}

// setTimeout(() => {
//     test(bubbleOrder);
// }, 0);

// test(selectOrder);
// test(baseOrder);
// test(insertOrder);
// test(shellOrder);
testAlgorithm(mergeSort);
// test(shellSort, 1, 20);
// test(mergeOrder);
