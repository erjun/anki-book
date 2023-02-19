let bookTag = 'coca::book::0';

function invoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("error", () => reject("failed to issue request"));
        xhr.addEventListener("load", () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw "response has an unexpected number of fields";
                }
                if (!response.hasOwnProperty("error")) {
                    throw "response is missing required error field";
                }
                if (!response.hasOwnProperty("result")) {
                    throw "response is missing required result field";
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open("POST", "http://127.0.0.1:8765");
        xhr.send(JSON.stringify({ action, version, params }));
    });
}

async function getNotesByRank(rank) {
    let query = `deck:Word::COCA60000 RANK:${rank}`;
    return await invoke("findNotes", 6, {
        query: query,
    });
}

async function getNotesByTags(tags) {
    let query = `tag:${tags}`;
    return await invoke("findNotes", 6, {
        query: query,
    });
}

async function addTags(notes, tags) {
    return await invoke("addTags", 6, {
        notes: notes,
        tags: tags,
    });
}

// 0: The Little Prince
// 1:
// 2:

async function check() {
    let notes = await getNotesByTags(bookTag);
    let info = await invoke('notesInfo', 6, {
        notes: notes
    })
    console.log(info);
    // for (let i = 0; i < notes.length; i++) {
    //     const id = notes[i];
    //     const note = 
    //     // const
    // }
}

async function start() {
    let rankList = showCoca();
    let len = rankList.length;
    // len = 10;
    for (let i = 0; i < len; i++) {
        const r = rankList[i];
        let a = i + 1;
        console.log(`开始添加tag:${bookTag},总数${rankList.length},当前${a},还剩${rankList.length - a}`);
        let notes = await getNotesByRank(r);
        await addTags(notes, bookTag);
        console.log('添加成功!');
    }
}

function queryWord2(word) {
    let arr = queryAll(word);
    let html = arr.map(item => {
        let num = ['TOTAL', 'SPOKEN', 'FICTION', 'MAGAZINE', 'NEWSPAPER', 'ACADEMIC'].sort((a, b) => {
            return Number(item[b]) - Number(item[a])
        }).map(key => {
            return `<span class="${key.toLowerCase()}">${key}:${item[key]}</span>`
        }).join('');

        return `<div>
            <span class="rank">RANK:${item['RANK #']}</span>
            <span class="pos">PoS:${item['PoS']}</span>
            ${num}
        </div>`
    }).join('');
    return html
}

function showCoca() {
    let result = [];
    let noFind = [];
    let atime = new Date().getTime();
    window.text.forEach(word => {
        let all = queryAll(word);
        if (all.length == 0) {
            noFind.push(word);
        } else {
            // result = result.concat(all);
            result.push(all[0])
        }
    });
    let btime = new Date().getTime();
    console.log(`全部查询耗时${btime - atime}毫秒`)
    result = result.sort((a, b) => {
        return Number(a['RANK #']) - Number(b['RANK #'])
    })
    let min = 3000;
    let max = 60000;
    result = result.filter(item => {
        return item['RANK #'] < max && item['RANK #'] > min
    })
    let html = `<div>
    <div>总数${result.length}</div>
    <div>最小${result[0]['RANK #']}</div>
    <div>最大${result[result.length - 1]['RANK #']}</div>
    </div>`
    document.getElementById('showCoca').innerHTML = html
    window.result = result;
    console.log(result);
    return result.map(item => { return item['RANK #'] });
}
// invoke("deckNames", 6).then((r) => {
//   console.log(r);
// });
var ankiPlay = {
    aud: null,
    async guiCurrentCard() {
        return await invoke("guiCurrentCard", 6);
    },
    async guiShowQuestion() {
        await invoke("guiShowQuestion", 6);
    },
    async guiShowAnswer() {
        await invoke("guiShowAnswer", 6);
    },
    async guiAnswerCard(ease) {
        await invoke("guiAnswerCard", 6, {
            ease,
        });
    },
    async get() {
        let card = await this.guiCurrentCard();
        let fornt = card.fields['Word'];
        // console.log('http://127.0.0.1:8081/10_3194.mp3');
        // document.getElementById('ankiAudio').setAttribute('src', 'http://127.0.0.1:8081/10_3194.mp3');
        this.play('http://127.0.0.1:8081/10_3194.mp3');
    },
    play(mp3) {
        if (this.aud == null) {
            this.aud = new Audio(mp3);
        } else {
            this.aud.src = mp3
        }
        this.aud.play();
    },
    init() {

    }
}