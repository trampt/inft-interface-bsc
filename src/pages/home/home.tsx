import { useIntl } from 'umi';
import useCategory from '@/hooks/useCategory';
import { useEffect, useState } from 'react';
import { useHistory } from 'umi';
import { recentlyListed } from '@/servers';
import { useWallet } from '@binance-chain/bsc-use-wallet';
import { useWindowSize } from 'react-use';
import SearchContract from '@/components/SearchContract';
import { Modal, Button, notification, Input } from 'antd';
import { queryDetail, queryOrder, queryMintToken } from '@/servers';
import React from 'react';
import {
  buyToken,
  sendToken,
  sellToken,
  sellTokenCancel,
} from '@/helpers/treasureland';
import Axios from 'axios';
const axios = Axios.create({
  baseURL: 'https://api.treasureland.market/v2/v1/',
  timeout: 30000,
});

axios.interceptors.response.use(
  function (response) {
    const { data: res } = response;
    const { code, message, data } = res;
    if (code === 0) {
      return data;
    } else {
      return Promise.reject(res);
    }
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  },
);

import styles from './styles.less';

export default () => {
  const intl = useIntl();
  const wallet = useWallet();
  const categories = useCategory();
  const [cateId, setCateId] = useState(null);
  const history: any = useHistory();
  const [recentlyItems, setRecentlyItems] = useState<any[]>([]);
  const { width, height } = useWindowSize();
  const [contractAddress, setContractAddress] = useState(null);
  const orderIds: any[] = [224842];
  useEffect(() => {
    setup();
  }, []);

  const setup = async () => {
    const { items }: any = await recentlyListed();
    if (items && items.length) {
      console.log(items);
      console.log(items.slice(0, 3));
      setRecentlyItems(items.slice(0, width <= 768 ? 4 : 3));
    }
  };

  const onClickCate = (id: number) => {
    setCateId(id);
    if (id === 0) {
      history.push('/market');
    } else {
      history.push({
        pathname: '/market',
        query: {
          cate_id: id,
        },
      });
    }
  };

  const handleClickCard = (params: any) => {
    const { contract, tokenId, orderId } = params;
    history.push(`/market/${contract}/${tokenId}/${orderId}`);
  };

  const contractAddressChange = (e: any) => {
    setContractAddress(e.target.value);
  };
  const getOrderList = () => {
    let owner = contractAddress;
    console.log('正在搜索上架商品。。。。。：');
    console.log(orderIds);
    axios
      .get(
        'https://api.treasureland.market/v2/v1/account/assets?chain_id=0&owner=' +
          owner +
          '&page_no=1&page_size=9999',
      )
      .then((res) => {
        if (res && res.list) {
          res.list.forEach((a) => {
            if (a.owner == owner && a.order_id != 0) {
              var obj = orderIds.find((c) => {
                return c == a.order_id;
              });
              if (obj == null || obj == undefined) {
                orderIds.push(a.order_id);
              }
            }
          });
        }
      });
  };

  const handleSearchClick = () => {
    setInterval(getOrderList, 3000);

    setInterval(async function () {
      if (orderIds.length > 0) {
        let orderId = orderIds.pop();
        const data: any = await queryOrder(orderId);
        if (data.code != 1001) {
          const result = await buyToken(data, wallet.account as string, 1);
        }
      }
    }, 500);
    //console.log(this.refs.txtContractAddress.value);
    //let owner='0x3ab63c53de878c81622f547efeb86de17fd3f74e';
    //   let owner=contractAddress;
    //   axios.get('https://api.treasureland.market/v2/v1/account/assets?chain_id=0&owner='+owner+'&page_no=1&page_size=9999').then(res=>{
    //   if(res)
    //   {
    //     if(res.list && res.list.length>0)
    //     {
    //       res.list.forEach(async a=>{
    //         console.log('go to search...')
    //         if(a.owner==owner)// && a.order_id!=0
    //         {
    //           orderIds.push(a.order_id);
    //           const data: any = await queryOrder(a.order_id);
    //           if(data.code!=1001)
    //           {
    //             const result = await buyToken(data, wallet.account as string, 1);
    //           }
    //           //console.log(data);
    //           //const data:any=await queryOrder('224666');
    //           //const result = await buyToken(data, wallet.account as string, 1);
    //         }

    //       });

    //     }
    //     else{
    //         notification.error({
    //           message: '没有找到上架商品，正准备进入下一次循环.',
    //         });
    //     }

    //   }
    // });
  };

  return (
    <div className={styles.home}>
      <div className={styles.contractAddress}>
        <Input
          placeholder="请输入合约地址"
          maxLength={50}
          onChange={(e) => contractAddressChange(e)}
        />
      </div>
      <Button
        type="primary"
        block
        size="large"
        className={styles.btn}
        onClick={handleSearchClick}
      >
        开始查询
      </Button>
      <div id="divResult"></div>
    </div>
  );
};
