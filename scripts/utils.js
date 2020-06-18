
const asObject = function asObject(array, prop){
    return array.reduce((result, item, index) => {
        let key = prop || index;
        // TODO: strip spaces.  Remove when ids are fixed
        result[item[key].replace(/ /g, "")] = item;
        return result;
    }, {});
}

const formatDate = function formatDate(date){
    return date ? `${date.getMonth()}/${date.getDay()} &middot; ${date.getHours()}:${date.getMinutes()}`: '';
}
export default {
    asObject,
    formatDate
};