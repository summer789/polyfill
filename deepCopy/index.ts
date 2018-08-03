function deepCopy() {
    let hasObj = [];
    return function clone(data) {
        if (typeof data !== 'object') {
            return data;
        }
        hasObj.push(data);
        let isArray = Array.isArray(data);
        let copy = isArray ? [] : {};
        if (isArray) {
            data.forEach(element => {
                if (typeof element !== 'object') {
                    copy.push(element);
                } else {
                    copy.push(clone(element));
                }
            })
        } else {
            const kyes = Object.keys(data);
            kyes.forEach(key => {
                const item = data[key];
                if (typeof item === 'object') {
                    const index = hasObj.indexOf(item)
                    if (index !== -1) {
                        console.log('循环引用')
                        // copy[key] = hasObj[index];
                        return
                    } else {
                        clone(item);
                    }

                } else {
                    copy[key] = item;
                }

            });
        }

        return copy;
    }
}