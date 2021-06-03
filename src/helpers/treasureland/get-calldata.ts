import cryptozABI from '@/abis/cryptoz.json';
const ethers = require('ethers');
console.log(ethers);

/**
 * @desc 计算 calldata
 * @param {string} e 固定 erc721
 * @param {string} t maker 卖方钱包地址
 * @param {string} n 固定 0x0000000000000000000000000000000000000000
 * @param {string} r tokenId
 * @param {int}    a 固定 amount 当前项目固定为 1
 * @returns
 */
function getCalldata(e: string, t: string, n: string, r: string, a: number) {
  let o = cryptozABI;
  let s = new ethers.utils.Interface(o);

  let l = s.encodeFunctionData('transferFrom(address,address,uint256)', [
    t,
    n,
    r,
  ]);

  return l;
}

export default getCalldata;
