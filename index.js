const axios = require('axios');
const fsPromises = require('fs').promises;

const apiUrl = ["informations.json", "jobs.json", "users.json"]

const allData = {};

async function fetchData() {
    await fsPromises.mkdir("./backup", { recursive: true })

    for (let i = 0; i < apiUrl.length; i++) {
        allData[apiUrl[i].replace(".json", "")] = await getDataFromApi(apiUrl[i])
    }
    sanitizeData(allData)
}
fetchData()

function sortedS(sorted, para, id) {
    sorted[id] = { ...sorted[id], [para]: sanitazeName(sorted[id][para]) }
    return sorted[id].para
}

async function sanitizeData(allData) {

    var id = ["informations", "jobs", "users"]

    var sorted = {};


    for (const property in allData) {

        for (const id in allData[property]) {

            if (!sorted?.[id]?.name) {
                sorted[id] = { ...sorted[id], name: sanitazeName(allData.users[id].name) }
            }else if(sorted[id].name === "#ERROR" && sorted[id]?.name){
                sorted[id] = { ...sorted[id], name: sanitazeName(allData[property][id].name)}
            }
            
            if (!sorted?.[id]?.age && allData.informations[id]?.age) {
                sorted[id] = { ...sorted[id], age: allData.informations[id].age }
            }
        
            if (!sorted?.[id]?.city) {
                sorted[id] = { ...sorted[id], city: sanitazeCity(allData[property][id].city) }
                if (sorted[id].city == undefined) {
                    delete sorted[id].city
                }
            }

            if (!sorted[id]?.job && sorted?.[id]) {
                sorted[id] = { ...sorted[id], job: allData[property][id].job }
                if (sorted[id].job == undefined || sorted[id].job == null) {
                    delete sorted[id].job
                }
            }
        }
    }
    const file = await fsPromises.appendFile(".\\backup\\" + 'result.json', JSON.stringify(sorted));
    return sorted
}

function sanitazeName(name) {

    const vowel = [["3", "e"], ["4", "a"], ["1", "i"], ["0", "o"]]

    if (name) {
        for (let i = 0; i < vowel.length; i++) {
            name = name.replace(new RegExp(vowel[i][0], "g"), vowel[i][1])
            name = name.charAt(0).toUpperCase() + name.substr(1)
        }
        return name;
    }
}
sanitazeName()

function sanitazeCity(city) {
    if (city) {
        let newCity = city.toLowerCase()
        newCity = newCity.charAt(0).toUpperCase() + newCity.substr(1)
        return newCity
    }
}

async function compileOne(url, data) {
    const file = await fsPromises.appendFile(".\\backup\\" + url, data);
}

async function getDataFromApi(url) {
    var config = {
        method: 'get',
        url: `https://recrutement-practice-default-rtdb.firebaseio.com/${url}`,
        headers: {}
    };

    try {
        const res = await axios(config);
        await compileOne(url, JSON.stringify(res.data))
        return res.data
    } catch (error) {
        return error
    }
}

module.exports = sanitizeData



