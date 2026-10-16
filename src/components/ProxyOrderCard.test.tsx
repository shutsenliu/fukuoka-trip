// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProxyOrderCard } from './ProxyOrderCard';
vi.mock('../lib/proxyPhotos',()=>({prepareProxyPhoto:vi.fn(async(file:File)=>file)}));
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
test('saved and newly uploaded photos stay hidden until explicitly opened',async()=>{
 URL.createObjectURL=vi.fn(()=>'blob:test-photo');URL.revokeObjectURL=vi.fn();
 const save=vi.fn(async()=>{});
 render(<ProxyOrderCard order={{id:'o',personId:'chi',itemId:'p',quantity:3,notes:''}} person={{id:'chi',name:'chi'}} product={{id:'p',name:'測試商品',image:'items/placeholder.svg',notes:'介紹不要顯示',placeIds:[]}} purchase={{orderId:'o',photo:new Blob(['saved']),amountYen:300,updatedAt:'2026-12-12T00:00:00Z'}} disabled={false} onSave={save} onRemove={vi.fn()}/>);
 expect(screen.queryByAltText('購買照片',{exact:true})).toBeNull();
 expect(screen.queryByText('介紹不要顯示')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'查看購買照片'}));
 expect(screen.getByAltText('購買照片',{exact:true})).toBeTruthy();
 fireEvent.change(screen.getByLabelText('選擇購買照片'),{target:{files:[new File(['new'],'new.jpg',{type:'image/jpeg'})]}});
 await waitFor(()=>expect(screen.queryByAltText('購買照片',{exact:true})).toBeNull());
 fireEvent.click(screen.getByRole('button',{name:'儲存購買結果'}));
 await waitFor(()=>expect(save).toHaveBeenCalledWith(expect.objectContaining({orderId:'o',amountYen:300,photo:expect.any(Blob)})));
});
