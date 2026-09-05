import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserProvider, Contract, formatEther, parseEther} from 'ethers';
import './styles.css';

const CARD_ABI=[
 'function mint(string metadataURI) returns (uint256)','function tokenURI(uint256) view returns (string)','function ownerOf(uint256) view returns (address)','function balanceOf(address) view returns (uint256)','function tokenOfOwnerByIndex(address,uint256) view returns (uint256)','function approve(address,uint256)','function setApprovalForAll(address,bool)','function isApprovedForAll(address,address) view returns (bool)','event CardMinted(address indexed owner,uint256 indexed tokenId,string tokenURI)'
];
const MARKET_ABI=[
 'function list(uint256 tokenId,uint256 price)','function buy(uint256 tokenId) payable','function cancel(uint256 tokenId)','function listings(uint256) view returns (address seller,uint256 price)','event Listed(address indexed seller,uint256 indexed tokenId,uint256 price)','event Purchased(address indexed buyer,address indexed seller,uint256 indexed tokenId,uint256 price)'
];
const ipfs=(u)=>u?.replace('ipfs://','https://gateway.pinata.cloud/ipfs/');

function App(){
 const [provider,setProvider]=useState(); const [signer,setSigner]=useState(); const [account,setAccount]=useState('');
 const [cards,setCards]=useState([]); const [owned,setOwned]=useState([]); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 const cardAddr = import.meta.env.VITE_CARD_ADDRESS || "0x0000000000000000000000000000000000000000";
 const marketAddr = import.meta.env.VITE_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000";
 const card=signer&&new Contract(cardAddr,CARD_ABI,signer); const market=signer&&new Contract(marketAddr,MARKET_ABI,signer);
 async function connect(){try{if(!window.ethereum)throw Error('Install MetaMask'); const p=new BrowserProvider(window.ethereum); const network=await p.getNetwork(); const wanted=BigInt(import.meta.env.VITE_CHAIN_ID||11155111); if(network.chainId!==wanted) throw Error(`Wrong network. Switch to chain ID ${wanted}`); const s=await p.getSigner(); setProvider(p);setSigner(s);setAccount(await s.getAddress());}catch(e){setMessage(e.message)}}
 async function upload(file,name,description,rarity,attributes){
   const jwt=import.meta.env.VITE_PINATA_JWT;if(!jwt)throw Error('Missing VITE_PINATA_JWT');
   const headers={Authorization:`Bearer ${jwt}`}; const fd=new FormData();fd.append('file',file);
   const image=await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS',{method:'POST',headers,body:fd}).then(r=>r.json());
   const metadata={name,description,image:`ipfs://${image.IpfsHash}`,attributes:[{trait_type:'Rarity',value:rarity},...JSON.parse(attributes||'[]')]};
   const md=await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({pinataContent:metadata,pinataMetadata:{name:`${name}.json`}})}).then(r=>r.json());
   return `ipfs://${md.IpfsHash}`;
 }
 async function mint(e){e.preventDefault();try{setBusy(true);const f=e.currentTarget;const uri=await upload(f.image.files[0],f.name.value,f.description.value,f.rarity.value,f.attributes.value);const tx=await card.mint(uri);await tx.wait();setMessage('Card minted successfully');f.reset();await load();}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 async function load(){if(!provider||!account)return;try{setBusy(true);const c=new Contract(cardAddr,CARD_ABI,provider);const m=new Contract(marketAddr,MARKET_ABI,provider);const mintEvents=await c.queryFilter(c.filters.CardMinted(),-2000,'latest');const unique=[...new Set(mintEvents.map(x=>x.args.tokenId.toString()))];const data=await Promise.all(unique.map(async id=>{const uri=await c.tokenURI(id);const meta=await fetch(ipfs(uri)).then(r=>r.json());let owner='';try{owner=await c.ownerOf(id)}catch{} const listing=await m.listings(id);return {id,owner,uri,meta,listing:{seller:listing.seller,price:listing.price}}}));setCards(data);setOwned(data.filter(x=>x.owner?.toLowerCase()===account.toLowerCase()||x.listing.seller.toLowerCase()===account.toLowerCase()));}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 useEffect(()=>{if(account)load()},[account]);
 async function listCard(id,price){try{setBusy(true);if(!await card.isApprovedForAll(account,marketAddr)){const a=await card.setApprovalForAll(marketAddr,true);await a.wait()}const tx=await market.list(id,parseEther(price));await tx.wait();await load()}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 async function buy(id,price){try{setBusy(true);const tx=await market.buy(id,{value:price});await tx.wait();await load()}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 async function cancel(id){try{setBusy(true);const tx=await market.cancel(id);await tx.wait();await load()}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 return <main><header><div><h1>✦ Arcane Cards</h1><p>Mint, collect and trade unique fantasy game cards.</p></div><button onClick={connect}>{account?`${account.slice(0,6)}…${account.slice(-4)}`:'Connect Wallet'}</button></header>{message&&<div className="notice">{message}</div>}
 {account&&<><section className="panel"><h2>Mint a card</h2><form onSubmit={mint}><input name="name" placeholder="Card name" required/><textarea name="description" placeholder="Description" required/><select name="rarity"><option>Common</option><option>Rare</option><option>Epic</option><option>Legendary</option></select><input name="image" type="file" accept="image/*" required/><textarea name="attributes" placeholder='Extra attributes JSON, e.g. [{"trait_type":"Power","value":88}]'/><button disabled={busy}>Mint to IPFS + NFT</button></form></section>
 <section><h2>Marketplace</h2><div className="grid">{cards.filter(x=>x.listing.seller!=='0x0000000000000000000000000000000000000000').map(x=><Card key={x.id} x={x} account={account} onBuy={buy} onCancel={cancel}/>)}</div></section>
 <section><h2>Your collection</h2><div className="grid">{owned.map(x=><Card key={x.id} x={x} account={account} onList={listCard}/>)}</div></section></>}</main>
}
function Card({x,account,onBuy,onCancel,onList}){const listed=x.listing.seller!=='0x0000000000000000000000000000000000000000';const mine=x.owner?.toLowerCase()===account.toLowerCase();const [price,setPrice]=useState('0.01');return <article className="card"><img src={ipfs(x.meta.image)} alt={x.meta.name}/><h3>{x.meta.name} <small>#{x.id}</small></h3><p>{x.meta.description}</p><div className="tags">{(x.meta.attributes||[]).map((a,i)=><span key={i}>{a.trait_type}: {a.value}</span>)}</div>{listed?<><strong>{formatEther(x.listing.price)} ETH</strong>{x.listing.seller.toLowerCase()===account.toLowerCase()?<button onClick={()=>onCancel(x.id)}>Cancel listing</button>:<button onClick={()=>onBuy(x.id,x.listing.price)}>Buy card</button>}</>:mine&&onList?<div className="list"><input value={price} onChange={e=>setPrice(e.target.value)} type="number" step="0.001" min="0.000001"/><button onClick={()=>onList(x.id,price)}>List for sale</button></div>:null}</article>}
createRoot(document.getElementById('root')).render(<App/>);

