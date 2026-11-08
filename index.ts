import { Api, Client } from 'traq-bot-ts';
import { Parser, jaModel } from "budoux";
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const api = new Api({
    baseApiParams: { headers: { Authorization: `Bearer ${process.env.TOKEN}` } },
});
const client = new Client({ token: process.env.TOKEN });

const phraseParser = new Parser(jaModel);

let database: string[] = []

const AhoCorasick = require('ahocorasick');

let prev_pow2: string = "";
let prev_pow2_index: bigint = 0n;

const numberstamp = ["5334cc7a-6510-4ea5-9e20-f85db75aa47a", "9f0be841-fbfa-4abf-871e-c1c72627e691", "350c45b4-a048-4f62-bf2b-e98f4edef40c", "ea0e7725-5b86-456b-b34a-060035153be2", "1463cc12-9758-478f-b968-e031a912d426", "2d04f8d3-b2db-4e53-b11c-111350c7b70d", "4134c613-8e9d-45f8-a8e3-d0f0d464d788", "0e76176f-fa55-4ba3-aa28-af9b6c247871", "08e48c75-5ba9-4c9c-a09a-426861f60329", "776b01db-95dc-474f-a3a7-a727f9803345"]


const result_stamps = {
    "internal_error": "019a542a-bfc8-7109-94f1-8724b9bbc7ae",
    "penalty": "019a5431-7521-712f-ab6d-cbf12636282d",
    "wrong_wrong_wrong_answer": "019b5e61-e61f-79df-b5bf-f46bb8e302f3",
    "re_rere": "019b5e62-8afa-79e1-8f52-9ce219283251",
    "wa_oso_and_deka": "019b5e6a-dab3-79e4-bfcb-130138ff138f",
    "wa_oso": "019b5e71-f09e-79ef-94fa-41e8db2a7117",
    "wa_completely_wrong_answer": "019e4092-cce9-786c-ae68-2ccad482e63f",

};

const algorithm_words = {
    "セグ木": ["セグ木の図", "セグメント", "木"],
    "遅延セグ木": ["遅延", "セグメント", "木"],
    "遅延セグメント木": ["遅延", "セグメント", "木"],
    "セグメント木": ["セグ木の図", "セグメント", "木"],
    "平衡二分木": ["平衡二分木の図"],
    "平衡二分探索木": ["平衡二分木の図"],
    "set": ["平衡二分木の図"],
    "木": ["木の図", "木"],
    "DAG": ["DAGの図", "有向", "非巡回", "グラフ"],
    "有向非巡回グラフ": ["DAGの図", "有向", "非巡回", "グラフ"],
    "有向巡回グラフ": ["DCGの図"],
    "1099511627776": ["1099511627776"],
    "2251799813685248": ["2251799813685248"],
    "9223372036854775808": ["9223372036854775808"],
    "18446744073709551616": ["18446744073709551616"],
    "2417851639229258349412352": ["2417851639229258349412352"],
    "大嵐": ["Suddenly_A_Tempest"],
    "二分探索": ["二分探索の図", "二分", "探索"],
    "壁紙": ["atcoder_wallpaper"],
    "遅延伝播反転可能乱択平衡二分木": ["遅延伝播反転可能乱択平衡二分木"],
    "ローリングハッシュ": ["ローリングハッシュ"],
    "ロリハ": ["ローリングハッシュ"],
    "行列": ["行列"],
    "matrix": ["行列"],
    "対角化": ["thonk_diagonalized", "thonk_sweat_diagonalized"],
    "回転": ["2251799813685248_rot"],
    "rot": ["2251799813685248_rot"],
    "的": ["target_atcoder"],
    "target": ["target_atcoder"],
    "幅優先探索": ["幅", "優先", "探索"],
    "深さ優先探索": ["深さ", "優先", "探索"],
    "DFS": ["深さ", "優先", "探索"],
    "dfs": ["深さ", "優先", "探索"],
    "行列累乗": ["行列", "累乗"],
    "キュー": ["キューの図"],
    "スタック": ["スタックの図"],
    "優先度付きキュー": ["優先", "度", "付き", "キューの図"],
    "プライオリティーキュー": ["優先", "度", "付き", "キューの図"],
    "priority queue": ["優先", "度", "付き", "キューの図"],
    "priority_queue": ["優先", "度", "付き", "キューの図"],
    "頂点倍化": ["頂点", "倍化"],
    "頂点倍加": ["頂点", "倍化"],
    "超頂点": ["超", "頂点"],
    "union find": ["union", "find"],
    "Union Find": ["union", "find"],
    "Union find": ["union", "find"],
    "union Find": ["union", "find"],
    "unionfind": ["union", "find"],
    "UnionFind": ["union", "find"],
    "累積和": ["累積", "和"],
    "階差": ["階差"],
    "RLE": ["連長", "圧縮"],
    "連長圧縮": ["連長", "圧縮"],
    "ランレングス圧縮": ["連長", "圧縮"],
    "LZ圧縮": ["LZ", "圧縮"],
    "Lz圧縮": ["LZ", "圧縮"],
    "永続配列": ["永続", "配列"],
    "座標圧縮": ["座標", "圧縮"],
    "座圧": ["座標", "圧縮"],
    "動的計画法": ["動的", "計画", "法"],
    "DP": ["動的", "計画", "法"],
    "dp": ["動的", "計画", "法"],
    "線形計画法": ["線形", "計画", "法"],
    "LP": ["線形", "計画", "法"],
    "lp": ["線形", "計画", "法"],
    "貪欲": ["貪欲"],
    "尺取り": ["尺取り"],
    "いもす": ["いもす"],
    "再帰": ["再帰"],
    "平方数": ["平方", "数"],
    "平方分割": ["平方", "分割"],
    "平方根": ["平方", "根"],
    "分割数": ["分割", "数"],
    "分割統治": ["分割", "統治"],
    "ゼータ変換": ["ゼータ", "変換"],
    "メビウス変換": ["メビウス", "変換"],
    "FFT": ["高速", "フーリエ", "変換"],
    "フーリエ級数展開": ["フーリエ", "級数", "展開"],
    "等差数列": ["等差", "数", "列"],
    "等比数列": ["等比", "数", "列"],
    "等比級数": ["等比", "級数"],
    "調和級数": ["調和", "級数"],
    "約数": ["約数"],
    "重軽分解": ["重軽", "分解"],
    "HLD": ["重軽", "分解"],
    "連結成分": ["連結", "成分"],
    "強連結成分": ["強", "連結", "成分"],
    "強連結成分分解": ["強", "連結", "成分", "分解"],
    "SCC": ["強", "連結", "成分", "分解"],
    "素因数分解": ["素因数", "分解"],
    "最大公約数": ["最大", "公", "約数"],
    "GCD": ["最大", "公", "約数"],
    "gcd": ["最大", "公", "約数"],
    "最小公倍数": ["最小", "公", "倍数"],
    "LCM": ["最小", "公", "倍数"],
    "lcm": ["最小", "公", "倍数"],
    "全域木": ["全域", "木"],
    "格子点": ["格子点"],
    "アホコラ": ["aho", "corasick"],
    "エイホーコラシック": ["aho", "corasick"],
    "KMP": ["KMP"],
    "双対": ["双対"],
    "ダイクストラ": ["ダイクストラ"],
    "ベルマンフォード": ["ベルマンフォード"],
    "ワーシャルフロイド": ["ワーシャルフロイド"],
    "最長増加部分列": ["最長", "増加", "部分列"],
    "LIS": ["最長", "増加", "部分列"],
    "最長共通接頭辞": ["最長", "共通", "接頭辞"],
    "LCP": ["最長", "共通", "接頭辞"],
    "最長共通部分列": ["最長", "共通", "部分列"],
    "LCS": ["最長", "共通", "部分列"],
    "接尾辞配列": ["接尾辞", "配列"],
    "suffix array": ["接尾辞", "配列"],
    "Suffix Array": ["接尾辞", "配列"],
    "マンハッタン": ["マンハッタン"],
    "ユークリッド": ["ユークリッド"],
    "チェビシェフ": ["チェビシェフ"],
    "距離": ["距離"],
    "多項式": ["多項式"],
    "trie木": ["trie", "木"],
    "トライ木": ["trie", "木"],
    "閉路": ["閉路"],
    "cycle": ["閉路"],
    "サイクル": ["閉路"],
    "転倒数": ["転倒", "数"],
    "主客転倒": ["主客", "転倒"],
    "有向グラフ": ["有向", "グラフ"],
    "無向グラフ": ["無向", "グラフ"],
    "漸化式": ["漸化式"],
    "公式": ["公式"],
    "原始根": ["原始", "根"],
    "primitive root": ["原始", "根"],
    "根付き木": ["根", "付き", "木"],
    "直径": ["直径", "木の図"],
    "部分文字列": ["部分", "文字列"],
    "部分列": ["部分", "列"],
    "部分分数分解": ["部分", "分数", "分解"],
    "線形代数": ["線形", "代数"],
    "形式的べき級数": ["形式的", "冪", "級数"],
    "形式的冪級数": ["形式的", "冪", "級数"],
    "FPS": ["形式的", "冪", "級数"],
    "互いに素": ["互いに素"],
    "定数時間": ["定数時間"],
    "連続とは限らない部分列": ["連続とは限らない", "部分", "列"],
    "連続部分列": ["連続", "部分", "列"],
    "連続とは限らない部分文字列": ["連続とは限らない", "部分", "文字列"],
    "連続部分文字列": ["連続", "部分", "文字列"],
    "最大二部マッチング": ["最大", "二部", "マッチング"],
    "全探索": ["全", "探索"],
    "bit全探索": ["bit", "全", "探索"],
    "三分探索": ["三", "slash", "二", "二分", "探索"],
    "cpp": ["cpp"],
    "c++": ["cpp"],
    "C++": ["cpp"],
    "python": ["python"],
    "Python": ["python"],

};

const algorithm_stamps = {
    "三": numberstamp[3],
    "二": numberstamp[2],
    "cpp": "59316d10-7acf-4aae-8785-0daa90807cc3",
    "python": "5306b8c0-90c7-41e4-bd1c-561e419732dd",
    "1099511627776": "019d6841-af0d-7ea0-b66d-1a448563ca67",
    "2251799813685248": "019abf76-d145-71cc-87db-ce42e496f4de",
    "9223372036854775808": "019d6849-d979-7edf-882d-3f0af484f19d",
    "18446744073709551616": "019d684a-4c4c-7ee8-855d-30d1398f042c",
    "2417851639229258349412352": "019abff1-da7b-72bd-9ee8-09ee35a73fe6",
    "定数時間": "578f4645-c49b-44f3-b6b4-b0723a4aa0e7",
    "連続とは限らない": "019fb859-a634-7226-b62c-50c6b7774dc5",
    "連続": "019fb858-8ea6-721c-92d8-d2ff4f80a283",
    "統治": "019e92d2-1984-74e5-9f19-fd39b0fcc604",
    "マッチング": "019e7886-8425-7ec6-981e-52b798dbda64",
    "二部": "019e7885-d7f1-7ebd-80a5-c8451c44e1fc",
    "セグ木の図": "019b93de-fae5-7b5e-b4aa-01afa91e8b92",
    "平衡二分木の図": "019b93df-a7ae-7b60-8ed8-599223198e08",
    "木の図": "019b93e0-11a3-7b63-83a5-66d158330e29",
    "DAGの図": "019b93e0-8329-7b66-bcc2-72dfa9a41991",
    "DCGの図": "019b93e1-2056-7b68-bca1-44e553a14de0",
    "スタックの図": "019b93e1-9860-7b6b-918a-985bd377f7a7",
    "キューの図": "019b93e2-1618-7b6e-9d30-aa635f93a086",
    "Suddenly_A_Tempest": "019b93fd-255a-7bac-9a04-2ee1623db34b",
    "二分探索の図": "019b9415-a2b2-7bc8-9d09-db56b9290321",
    "atcoder_wallpaper": "019b970d-3f4a-7eec-92c3-763a77df0b52",
    "遅延伝播反転可能乱択平衡二分木": "019b9b9b-3076-789c-9c9c-61fa9f1066c4",
    "ローリングハッシュ": "019b9b9c-a48a-789f-85fe-6ff730ad9e8d",
    "行列": "019ba0d9-baa2-70c2-af39-d1f21ad10eaf",
    "thonk_diagonalized": "019bba9f-f46c-7150-838c-ad8a25d0fcd6",
    "thonk_sweat_diagonalized": "019bf7da-8f08-71e6-a452-24347a044b2e",
    "2251799813685248_rot": "019c32fb-4cb1-7d38-98d9-8b0aeddb1710",
    "target_atcoder": "019d4210-c709-7ec0-adee-f9ee604d695a",
    "幅": "019e2c0c-3011-79ae-bb77-661b1d848f23",
    "探索": "019e2c0c-6c5d-79b6-bdf3-dc7c26da5674",
    "二分": "019e2c0c-a2ba-79bd-8a9b-e8f2b168c4c3",
    "累乗": "019e2c0d-0752-79c6-9f8b-9b6762ec9971",
    "深さ": "019e2c0d-35aa-79cd-99be-030ce5e7f309",
    "遅延": "019e2c0d-6115-79d4-b0b3-c4b76e78fbfc",
    "優先": "019e2c0d-b64b-79db-bfbf-3acfcd58863a",
    "度": "019e2c0d-ecf6-79e3-806d-f8f3b1d6b821",
    "次数": "019e2c0e-e1d2-79ea-9765-0f1ab9341e44",
    "頂点": "019e2c0f-28a9-79f2-8e9a-8d50591ac3f7",
    "辺": "019e2c10-1a1d-79fb-9645-5449148a4fb7",
    "倍化": "019e2c14-facf-7a12-bbef-a67b6607b935",
    "超": "019e2c15-2a02-7a1a-99e7-aa82f1d2c6b3",
    "付き": "019e2c15-83d0-7a24-9123-437f229fa0d2",
    "木": "019e2c15-b86f-7a2d-93f0-7b93cf6931ba",
    "union": "019e2c15-f10b-7a35-963f-e52a7a46ad40",
    "find": "019e2c16-1d1c-7a3c-9487-58c6d86829aa",
    "和": "019e2c16-57c2-7a44-b727-505bdad511f0",
    "累積": "019e2c16-e093-7a4e-af94-c8c7c62700e7",
    "階差": "019e2c17-9128-7a57-ad78-52e48bb96f43",
    "圧縮": "019e2c17-db0e-7a61-beb6-ff2a7cf3ec1f",
    "座標": "019e2c18-0cee-7a6a-a283-6f1ae8c0fcef",
    "連長": "019e2c18-4d0a-7a76-83c5-791cf941cd14",
    "LZ": "019e2c18-c394-7a7e-8752-d0d305ba5aac",
    "永続": "019e2c18-f503-7a85-a60c-9291085299f0",
    "動的": "019e2c19-23fa-7a8c-bb32-bd7e48bac6a4",
    "計画": "019e2c1a-2106-7a95-822c-8ca799e9669a",
    "法": "019e2c1a-7eb3-7a9c-9c86-127bf2b922ab",
    "貪欲": "019e2c1a-e156-7aa2-b6c5-271e10c46f3f",
    "尺取り": "019e2c1b-8331-7aa9-b5d5-d14805cb7a99",
    "いもす": "019e2c1b-b426-7ab1-9481-ab7ba0b1954b",
    "再帰": "019e2c1b-ecf4-7ab8-9766-1b0518c77c6b",
    "平方": "019e2c1c-353d-7abf-afcf-d8b581a293be",
    "分割": "019e2c1c-7135-7ac7-8bea-673d6bca18aa",
    "数": "019e2c1c-a27e-7ace-af2e-86178d3d5324",
    "高速": "019e2c1d-2f08-7adc-bde0-02601b35dcdf",
    "変換": "019e2c1d-7525-7ae4-ae67-428018e9ed35",
    "メビウス": "019e2c1e-25ce-7aeb-956f-197ec8233a2d",
    "ゼータ": "019e2c1e-8a7f-7af2-948a-230d1cbb50e7",
    "フーリエ": "019e2c1f-01c4-7afa-b194-8e0249f3d62e",
    "級数": "019e2c1f-4fe3-7b02-88be-ec600729a230",
    "等比": "019e2c1f-98ea-7b09-8ac6-c8d4049142bf",
    "等差": "019e2c20-935c-7b0f-99e1-fec87d1741dc",
    "展開": "019e2c20-d6e2-7b17-afa1-92ff8a444c24",
    "約数": "019e2c21-1bf5-7b1e-b395-158283f71020",
    "分解": "019e2c21-66f6-7b2c-b593-16e47114c360",
    "重軽": "019e2c21-dc09-7b35-8b56-7fb1bfbca00b",
    "素因数": "019e2c22-1aa8-7b3b-afd6-a774e2152819",
    "最大": "019e2c22-80fe-7b44-95e4-cd464ba420af",
    "倍数": "019e2c22-c7cc-7b4c-bb4f-a598d1712982",
    "最小": "019e2c23-0abd-7b53-9468-cc940cc18fa4",
    "調和": "019e2c23-6c53-7b5b-a71b-03bd1e620a57",
    "成分": "019e2c23-cfda-7b62-9f6c-7f7a46574729",
    "公": "019e2c24-06ad-7b69-8fb9-427c96bd47fe",
    "全域": "019e2c24-69fd-7b71-b93d-08bec2c6d1e8",
    "aho": "019e2c24-ad9a-7b7e-afca-4a338e452373",
    "corasick": "019e2c24-f44e-7b87-88c7-e79ca4ee9e9c",
    "bit": "019e2c1c-fbfc-7ad5-a533-14156d0fcf4f",
    "全": "727e4e5d-30db-403b-adbf-5204c36be421",
    "KMP": "019e2c25-a06d-7b8e-b0a5-6cd8e665ffda",
    "両端": "019e2c25-d438-7b95-b4c8-6f36ed47cc5c",
    "格子点": "019e2c26-fa32-7b9f-b7b7-9bbe58e270ea",
    "ダイクストラ": "019e2c27-585a-7ba6-8496-5189bd8440b8",
    "ベルマンフォード": "019e2c27-d29b-7baf-a999-0ab60c5c1d3c",
    "ワーシャルフロイド": "019e2c28-4440-7bb6-be13-964d4cb0fcb4",
    "セグメント": "019e2c28-6c16-7bbe-a1a9-54809a619ec6",
    "双対": "019e2c29-5b25-7bc9-8b61-fbc0fbc8911f",
    "線形": "019e2c29-d23b-7bd0-b961-25299610a53b",
    "最長": "019e2c2a-1aec-7bd7-b446-f6b932aeb7f3",
    "部分": "019e2c2a-c695-7bdf-b9a2-223d1aa13675",
    "共通": "019e2c2b-074f-7be6-9ca1-0ef3fa7120bd",
    "増加": "019e2c2b-4de0-7bf0-b7ae-4877e723feff",
    "列": "019e2c2b-bfcd-7bfd-aa10-2ccebd038b7f",
    "マンハッタン": "019e2c2c-5282-7c05-b458-273e7293ec05",
    "ユークリッド": "019e2c2c-e047-7c0c-adfc-0635c2ae8296",
    "チェビシェフ": "019e2c2d-4883-7c14-89d0-0d300b7b5257",
    "距離": "019e2c2d-7aa2-7c1c-99f5-ef6cf7be230d",
    "多項式": "019e2c2d-a612-7c23-9093-cdb2115c3ae5",
    "trie": "019e2c2d-d403-7c29-bd67-0ae65a8b5677",
    "転倒": "019e2c2e-1bd0-7c30-b3d9-666bc614987b",
    "閉路": "019e2c2e-5c86-7c38-8ac0-daf56edf44e6",
    "有向": "019e2c2e-97f8-7c40-88a0-f4b3a850eeba",
    "無向": "019e2c2e-d196-7c4b-832c-f55ec8fedf75",
    "非巡回": "019e2c2f-0625-7c52-9c56-d154ffac6568",
    "グラフ": "019e2c2f-40d3-7c59-875f-b23f2677f894",
    "漸化式": "019e2c2f-c3d8-7c60-a7be-5a7c0b3a1c04",
    "原始": "019e2c30-0af2-7c67-bcb6-8cf4df494813",
    "根": "019e2c30-48b6-7c6f-8d5b-b6034625dbd3",
    "互いに素": "019e2c30-a2e5-7c77-9f7c-be01527c6d6c",
    "公式": "019e2c31-1f88-7c83-a5bc-1469117ab28d",
    "直径": "019e2c31-4850-7c8b-b60e-daeff33d3eb7",
    "分数": "019e2c31-9c0d-7c9b-adfa-31fd0e22a070",
    "未証明貪欲": "019e2c31-f3ec-7cb1-a453-0c5163b53b7b",
    "接頭辞": "019e2c37-1fd6-7ccd-9c0c-5e17eaaff0e8",
    "接尾辞": "019e2c37-8f77-7cd5-9123-b2a78e422a14",
    "文字列": "019e2c38-4a08-7ce5-b88b-e613cfda34ba",
    "配列": "019e2c38-c1f9-7cee-bf80-224bda720b96",
    "形式的": "019e2f25-e2cd-7f14-9a8c-cc160a815f1e",
    "冪": "019e2f26-1538-7f1b-a529-cb07526335b8",
    "関数": "019e2f26-4a24-7f23-9578-1572b91914ff",
    "主客": "019e780d-dbfe-7e10-9032-5911f23b149d",
    "代数": "019e780e-0e42-7e17-83c8-4cee3b273be7",
    "強": "019e7883-ba92-7ead-b2b6-cd9bf2fdcf9d",
    "連結": "019e7884-2ecb-7eb4-b004-55147cde0758",
    "slash": "e653d068-6c5a-4c78-b260-139716925e1e",









    
};

const ac = new AhoCorasick(Object.keys(algorithm_words));



// const S = await api.stamps.getStamps();
// for (const T of S.data){
//   if (T.creatorId == "01963d57-a676-7b32-952f-e8120db79e95"){
//     console.log(`${T.name}: ${T.id}`);
//   }
// }


/**
 * 日本語の文を軽量なBudouXで文節に分割する。
 */
function decompose(text: string) {
    return phraseParser.parse(text)
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk.length > 0);
}
/**
 * Box-Muller法による正規分布に従う乱数の生成
 * @param {number} mean - 平均 (デフォルト: 0)
 * @param {number} stdev - 標準偏差 (デフォルト: 1)
 * @returns {number} 正規分布に従う乱数
 */
function randomNormal(mean = 0, stdev = 1) {
  let u1 = 0;
  let u2 = 0;
  // Math.random()が0になるのを防ぐ
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdev + mean;
}
function generate_random_text(){

    let res: string = "";

    if (database.length == 0){return res;}

    const M = Math.floor(Math.abs(randomNormal(0, 25))+1);

    for (let i = 0; i < M; i++){
        res += database[Math.floor(Math.random()*database.length)];
    }

    return res;
}
function generate_random_pow2(){
    let val = 1n;
    let N = BigInt(Math.floor(1+Math.random()*64));
    for (let i = 0n; i < N; i++){
        val *= 2n;
    }
    return {N, val}
}

client.on('PING', async ({ body }) => {
    await api.channels.postMessage("019a4ce9-d2de-74f6-9245-f43e303b1b6d", {content: "activated", embed: true});
});

client.on("BOT_MESSAGE_STAMPS_UPDATED", async ({ body }) => {

    if (body.messageId != prev_pow2){return;}
    if (body.stamps.length == 0){return;}
    
    if (body.stamps[0]?.stampId == "01978acd-e952-79f1-b09a-5c5a11621d1c"){
        let ans: bigint[] = [];
        while (prev_pow2_index > 0){
            ans.push(prev_pow2_index%10n);
            prev_pow2_index /= 10n;
        }
        ans.reverse();
        for (const n of ans){
            await api.messages.addMessageStamp(prev_pow2, numberstamp[Number(n)]??"019b5e62-8afa-79e1-8f52-9ce219283251", {count: 1});
        }
        prev_pow2 = "";
        return;
    }

    let stamplist = []

    for (const s of body.stamps){
        if (s.count >= 10){continue;}
        for (let i = 0; i < s.count; i++){
            stamplist.push(s);
        }
    }

    let res = 0n;
    let pow10 = 1n;
    
    stamplist.sort((a, b) =>  b.updatedAt.getTime() - a.updatedAt.getTime());

    for (const s of stamplist){
        const idx = numberstamp.indexOf(s.stampId);
        if (idx == -1){return;}
        if (pow10 >= 10000000000000000000000000000000000000000n){return;}
        res += pow10*BigInt(idx);
        pow10 *= 10n;
    }

    if (res == prev_pow2_index){
        await api.messages.addMessageStamp(prev_pow2, "daed768f-7bf9-4085-a50d-7bcad670ec52", {count: Math.min(100, Number(prev_pow2_index))});
        prev_pow2 = "";
    }

});

client.on('MESSAGE_CREATED', async ({ body }) => {
    const {
        user: { name },
        plainText,
        channelId,
        createdAt,
    } = body.message;


    console.log(`@${name} < ${plainText}`);

    if (plainText == `@BOT_2251799813685248 join`){
        console.log(`joined to ${channelId}`);
        await api.bots.letBotJoinChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage(channelId, {content: "join request: :accepted:", embed: true});
        return;
    }
    if (plainText == `@BOT_2251799813685248 leave`){
        console.log(`leaved from ${channelId}`);
        await api.bots.letBotLeaveChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage(channelId, {content: "leave request: :accepted:", embed: true});
        return;
    }
    if (plainText == `@BOT_2251799813685248 generate`){
        const res = generate_random_text();
        if (res == ""){
            await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
            return;
        }
        await api.channels.postMessage(channelId, { content: res, embed: true });
        return;
    }
    if (plainText == `@BOT_2251799813685248 pow2`){
        const val = generate_random_pow2();
        const res = await api.channels.postMessage(channelId, {content: `${val.val}`, embed: true});
        if (prev_pow2 != ""){
            await api.messages.addMessageStamp(prev_pow2, "6f8a7751-5276-426d-931d-bfb419e70038", {count: 1});
        }
        prev_pow2 = res.data.id;
        prev_pow2_index = val.N;
        return;
    }


    const search_res = ac.search(plainText);

    let used = new Set<string>();

    for (const match of search_res){
        for (const word of match[1]){
            if (used.has(word)){continue;}
            used.add(word);
            for (const stampname of algorithm_words[word as keyof typeof algorithm_words]){
                await api.messages.addMessageStamp(body.message.id, algorithm_stamps[stampname as keyof typeof algorithm_stamps] ?? "019b5e62-8afa-79e1-8f52-9ce219283251", {count: 1});
            }
        }
    }


    for (let token of decompose(plainText)){
        if (token.length > 100){
            let error_msg = `The phrase "${token}" is too long. Only first 100 characters will be recorded.`
            await api.channels.postMessage(channelId, {content: error_msg, embed: true});
            token = token.slice(0, 100);
        }
        database.push(token);
    }


    if (database.length > 6000){
        let database2: string[] = []
        for (let i = database.length-3000; i < database.length; i++){
            database2.push(database[i] ?? "");
        }
        database = database2;
    }

    if (name.match("BOT.*")){
        console.log("message from bot is ignored");
        return;
    }


    if (Math.random() < 0.15){
        const val = generate_random_pow2();
        const res = await api.channels.postMessage(channelId, {content: `${val.val}`, embed: true});
        if (prev_pow2 != ""){
            await api.messages.addMessageStamp(prev_pow2, "6f8a7751-5276-426d-931d-bfb419e70038", {count: 1});
        }
        prev_pow2 = res.data.id;
        prev_pow2_index = val.N;
    }
    

    if (Math.random() < 0.85){return;}


    const res = generate_random_text();
    if (res == ""){
        await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
        return;
    }
    await api.channels.postMessage(channelId, { content: res, embed: true });
    
});

client.on('DIRECT_MESSAGE_CREATED', async ({ body }) => {
    const {
        user: { name },
        plainText,
        channelId,
        createdAt,
    } = body.message;


    console.log(`@${name} < ${plainText}`);

    if (plainText == `@BOT_2251799813685248 join`){
        console.log(`joined to ${channelId}`);
        await api.bots.letBotJoinChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage(channelId, {content: "join request: :accepted:", embed: true});
        return;
    }
    if (plainText == `@BOT_2251799813685248 leave`){
        console.log(`leaved from ${channelId}`);
        await api.bots.letBotLeaveChannel("019ca9ff-d4e7-72ef-bc48-d76875345802", {channelId: channelId});
        await api.channels.postMessage(channelId, {content: "leave request: :accepted:", embed: true});
        return;
    }
    if (plainText == `@BOT_2251799813685248 generate`){
        const res = generate_random_text();
        if (res == ""){
            await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
            return;
        }
        await api.channels.postMessage(channelId, { content: res, embed: true });
        return;
    }
    if (plainText == `@BOT_2251799813685248 pow2`){
        const val = generate_random_pow2();
        const res = await api.channels.postMessage(channelId, {content: `${val.val}`, embed: true});
        if (prev_pow2 != ""){
            await api.messages.addMessageStamp(prev_pow2, "6f8a7751-5276-426d-931d-bfb419e70038", {count: 1});
        }
        prev_pow2 = res.data.id;
        prev_pow2_index = val.N;
        return;
    }


    const search_res = ac.search(plainText);

    let used = new Set<string>();

    for (const match of search_res){
        for (const word of match[1]){
            if (used.has(word)){continue;}
            used.add(word);
            for (const stampname of algorithm_words[word as keyof typeof algorithm_words]){
                await api.messages.addMessageStamp(body.message.id, algorithm_stamps[stampname as keyof typeof algorithm_stamps] ?? "019b5e62-8afa-79e1-8f52-9ce219283251", {count: 1});
            }
        }
    }


    for (let token of decompose(plainText)){
        if (token.length > 100){
            let error_msg = `The phrase "${token}" is too long. Only first 100 characters will be recorded.`
            await api.channels.postMessage(channelId, {content: error_msg, embed: true});
            token = token.slice(0, 100);
        }
        database.push(token);
    }


    if (database.length > 6000){
        let database2: string[] = []
        for (let i = database.length-3000; i < database.length; i++){
            database2.push(database[i] ?? "");
        }
        database = database2;
    }

    if (name.match("BOT.*")){
        console.log("message from bot is ignored");
        return;
    }


    if (Math.random() < 0.15){
        const val = generate_random_pow2();
        const res = await api.channels.postMessage(channelId, {content: `${val.val}`, embed: true});
        if (prev_pow2 != ""){
            await api.messages.addMessageStamp(prev_pow2, "6f8a7751-5276-426d-931d-bfb419e70038", {count: 1});
        }
        prev_pow2 = res.data.id;
        prev_pow2_index = val.N;
    }
    

    if (Math.random() < 0.85){return;}


    const res = generate_random_text();
    if (res == ""){
        await api.channels.postMessage(channelId, { content: ":runtime_error:", embed: true });
        return;
    }
    await api.channels.postMessage(channelId, { content: res, embed: true });
    
});

client.listen(() => {
    console.log('Listening...');
});
