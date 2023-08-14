const init_board = [
                    0, 1, 2,
                    3, 4, 5,
                    6, 7, 8
                    ];

const height = 3;
const width = 3;
const tiles_num = height * width;
const blank_tile = tiles_num - 1;
let now_board = [...init_board];

const permutation = (nums, k) => {
    let ans = [];
    if (nums.length < k) {
        return [];
    }
    if (k === 1) {
        for (let i = 0; i < nums.length; i++) {
        ans[i] = [nums[i]];
        }
    } else {
        for (let i = 0; i < nums.length; i++) {
            let parts = nums.slice(0);
            parts.splice(i, 1)[0];
            let row = permutation(parts, k - 1);
            for (let j = 0; j < row.length; j++) {
                ans.push([nums[i]].concat(row[j]));
            }
        }
    }
    return ans;
};

let per_to_idx = {};
let idx_to_per = {};
let permutations = permutation(init_board, 9);
permutations.forEach((per,i) => {
    per_to_idx[per] = i ;
    idx_to_per[i] = per;
});

const tiles = document.querySelectorAll(".tile");
const tiles_text = document.querySelectorAll(".number");
const four_directions = [-width, 1, width, -1];
let is_moving = false;
let is_animation = false;

// 0.3秒待機
function time_resolve() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 200);
    })
}

async function wait() {
    const result = await time_resolve();
}

// 盤面の生成
function make_board(now_board){
    tiles.forEach((tile,i) => {
        // console.log(tiles_text[i].textContent)
        if (now_board[i] != blank_tile) {
            tiles_text[i].textContent = `${now_board[i]}`;
        }else{
            tiles_text[i].textContent = "";
        }
        tiles_text[8] = 0
        for (let j = 0; j < tiles_num; j++) {
            tile.classList.remove(`no${j}`);
        }
        tile.classList.add(`no${now_board[i]}`);
        tile.classList.remove("up");
        tile.classList.remove("right");
        tile.classList.remove("down");
        tile.classList.remove("left");
    });
}

make_board(now_board);

function is_vaild(x){
    return 0 <= x < tiles_num;
}

// タイルを押したときのリアクション
function btn_action(moves_tile_idx){
    let blank_tile_idx = -1;
    for (let i = 0; i < tiles_num; i++) {
        if(now_board[i] == blank_tile){
            blank_tile_idx = i;
        }
    }
    if(moves_tile_idx === blank_tile_idx){
        return [-1, -1];
    }
    for (let i = 0; i < 4; i++) {
        val = four_directions[i];;
        replace_tile_idx = moves_tile_idx + val;
        if(is_vaild(replace_tile_idx)){
            if(now_board[replace_tile_idx] === blank_tile){
                return [i, replace_tile_idx];
            }
        }
    }
    return [-1, -1];
}

// タイル移動
function operate(moves_tile_idx, tile){
    let res = btn_action(moves_tile_idx);
    let i = res[0];
    let replace_tile_idx = res[1];
    if(i !== -1){
        if(i === 0){
            tile.classList.add("up");
            tiles[replace_tile_idx].classList.add("down");
        }else if(i === 1){
            tile.classList.add("left");
            tiles[replace_tile_idx].classList.add("right");
        }else if(i === 2){
            tile.classList.add("down");
            tiles[replace_tile_idx].classList.add("up");
        }else if(i === 3){
            tile.classList.add("right");
            tiles[replace_tile_idx].classList.add("left");
        }
        tmp1 = now_board[moves_tile_idx];
        tmp2 = now_board[replace_tile_idx];
        now_board[replace_tile_idx] = tmp1;
        now_board[moves_tile_idx] = tmp2;
        is_moving = true;
    }
    wait().then(result => {
        make_board(now_board);
        is_moving = false;
    });
}

// クリック時
tiles.forEach((tile, moves_tile_idx) => {
    tile.addEventListener("click",()=>{
        if (is_moving === false && is_animation === false) {
            is_moving = true;
            operate(moves_tile_idx, tile);
        }
    });
});

// 復元アニメーション
function restore(now_board, operations){
    is_animation = true;

    let cnt = 0;
    const countUp = () =>{
        operate(operations[cnt], tiles[operations[cnt]]);
        cnt += 1
    }
    const intervalId = setInterval(() =>{
    countUp();

    if(cnt > operations.length-1){
        clearInterval(intervalId);
        is_animation = false;
    }}, 250);
}

let reader = new FileReader();
const restoration_btn = document.getElementById('restoration-btn');

//ファイルを読み込む
let can_board_idx = []
let all_operations = []

let csv = new XMLHttpRequest();
csv.open("GET", "operations.csv", false);

try {
    csv.send(null);
} catch (err) {
    console.log(err);
}

let csvArray = [];
let lines = csv.responseText.split(/\r\n|\n/);

for (let i = 0; i < lines.length; ++i) {
    let cells = lines[i].split(",");
    let row = []
    if(cells.length !== 1){
        can_board_idx.push(i)
    }
    cells.forEach(cell => {
        row.push(Number(cell));
    });
    csvArray.push(row);
}

all_operations = csvArray
// 復元ボタン
restoration_btn.addEventListener("click",()=>{
    let idx = per_to_idx[now_board];
    let operations = all_operations[idx];
    // console.log(all_operations[idx])
    for (let i = 0; i < operations.length; i++) {
        operations[i] = Number.parseInt(operations[i]);
    }
    restore(now_board, operations);
});

// シャッフル
let random_btn = document.getElementById("random-btn");
random_btn.addEventListener("click", ()=>{
    if(is_animation == false){
        idx = Math.floor(Math.random() * (can_board_idx.length - 1));
        now_board = idx_to_per[can_board_idx[idx]];
        make_board(now_board);
    }
});
