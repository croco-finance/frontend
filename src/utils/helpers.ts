const mergeStringNumberObjects = (
    obj0: { [key: string]: number },
    obj1: { [key: string]: number },
) => {
    const objMerged: { [key: string]: number } = {};
    // iterate keys of object 0 and check
    for (const [keyObj0, value0] of Object.entries(obj0)) {
        // add all keys from obj0 to mergedObj
        objMerged[keyObj0] = value0;

        // if the same key is present in the second object
        if (obj1[keyObj0]) {
            objMerged[keyObj0] += obj1[keyObj0];
        }
    }

    // iterate through all the key in the second object and add those that are not present in the first one
    for (const [keyObj1, value1] of Object.entries(obj1)) {
        // if the same key is present in the second object
        if (!obj0[keyObj1]) {
            objMerged[keyObj1] = value1;
        }
    }

    return objMerged;
};

export { mergeStringNumberObjects };
