// src/constants/market.ts
import { teeteePair } from "../types";

export const INITIAL_PAIRS: teeteePair[] = [
    { id:'azuiro', name: 'AzuIro', members: ['AZKi', 'KazamaIroha'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'AI董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'fubumio', name: 'FubuMio', members: ['ShirakamiFubuki', 'OokamiMio'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'FM董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'micomet', name: 'miComet', members: ['SakuraMiko', 'HoshimachiSuisei'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'MM董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'noefure', name: 'NoeFure', members: ['ShiraganeNoel', 'ShiranuiFurea'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'NF董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'okakoro', name: 'OkaKoro', members: ['NekomataOkayu', 'InugamiKorone'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'OK董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'pekomarin', name: 'PekoMarin', members: ['UsadaPekora', 'HoshoMarin'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'PM董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'shishiwata', name: 'ShiShiWata', members: ['ShishiroBotan', 'TsunomakiWatame'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'SW董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'soraz', name: 'SorAZ', members: ['TokinoSora', 'AZKi'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'SA董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }},
    { id:'subaruna', name: 'SubaRuna', members: ['OozoraSubaru', 'HimemoriRuna'], price: 100, netValue:100, lastWeeklyNV: 100, change24h: 0, ceoTitle: 'SR董事長', history: [], pendingInteractions: { sharedLive: 0, collab: 0, xMention: 0 }}
].sort((a, b) => a.name.localeCompare(b.name));

