// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ProxyPage } from './ProxyPage';
vi.mock('../hooks/useProxyOrders',()=>({useProxyOrders:()=>({state:{catalog:{people:[{id:'chi',name:'chi'}],products:[{id:'a',name:'精華液',image:'items/placeholder.svg',notes:'不需要的介紹',placeIds:[]},{id:'b',name:'錠劑',image:'items/placeholder.svg',notes:'',placeIds:[]}],orders:[{id:'a',personId:'chi',itemId:'a',quantity:1,notes:''},{id:'b',personId:'chi',itemId:'b',quantity:3,notes:''}]},purchases:[{orderId:'a',amountYen:4900,photo:null,updatedAt:'2026-12-12T00:00:00Z'}]},loading:false,error:'',refresh:vi.fn(),save:vi.fn(),remove:vi.fn()})}));
afterEach(cleanup);
test('recipient opens photo-free summary with quantities, known amounts and total, then allows recording',()=>{
 render(<ProxyPage/>);
 expect(screen.queryByText('不需要的介紹')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'chi'}));
 const table=screen.getByRole('table');
 expect(within(table).getByText('精華液')).toBeTruthy();
 expect(within(table).getByText('3',{exact:true})).toBeTruthy();
 expect(within(table).getByText('未填寫')).toBeTruthy();
 expect(within(table).getAllByText('¥4,900')).toHaveLength(2);
 expect(screen.queryByRole('img')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'記錄／修改購買結果'}));
 expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
 fireEvent.click(screen.getByRole('button',{name:'查看彙總列表'}));
 expect(screen.getByRole('table')).toBeTruthy();
});
