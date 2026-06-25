// src/constants/market.ts
import { teeteePair } from "../types";

export const INITIAL_PAIRS: teeteePair[] = [
    {
        id: 'AZIR',
        name: 'AZIro',
        members: ['AZKi', 'KazamaIroha'],
        price: 100,
        change24h: 0,
        ceoTitle: 'AI董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'AZKi 在 X 提及 KazamaIroha：「今天的聯動非常開心！拓荒順利～」', link: 'https://x.com/azki_vocalist/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'AZIro 【MINECRAFT】聯動直播', link: 'https://www.youtube.com/watch?v=azuiro_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'FBMO',
        name: 'FubuMio',
        members: ['ShirakamiFubuki', 'OokamiMio'],
        price: 100,
        change24h: 0,
        ceoTitle: 'FM董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'ShirakamiFubuki 在 X 提及 OokamiMio：「Mio醬的手作便當超好吃！」', link: 'https://x.com/shirakamifubuki/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'FubuMio 【歌回】雙人歌回聯動！', link: 'https://www.youtube.com/watch?v=fubumio_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'MCMT',
        name: 'miComet',
        members: ['SakuraMiko', 'HoshimachiSuisei'],
        price: 100,
        change24h: 0,
        ceoTitle: 'MM董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'SakuraMiko 在 X 提及 HoshimachiSuisei：「今天去星街家吃火鍋了喔！」', link: 'https://x.com/sakuramiko35/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'miComet 【GTAV】商業貼貼大冒險！', link: 'https://www.youtube.com/watch?v=micomet_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'NEFL',
        name: 'NoeFure',
        members: ['ShiraganeNoel', 'ShiranuiFurea'],
        price: 100,
        change24h: 0,
        ceoTitle: 'NF董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'ShiraganeNoel 在 X 提及 ShiranuiFlare：「阿芙樂醬送我的杯子真可愛～」', link: 'https://x.com/shiroganenoel/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'NoeFure 【雜談】深夜情侶對談...', link: 'https://www.youtube.com/watch?v=noefure_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'OKKR',
        name: 'OkaKoro',
        members: ['NekomataOkayu', 'InugamiKorone'],
        price: 100,
        change24h: 0,
        ceoTitle: 'OK董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'InugamiKorone 在 X 提及 NekomataOkayu：「小粥今天也摸摸我的頭了！」', link: 'https://x.com/inugamikorone/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'OkaKoro 【健身環】看誰先累倒聯動！', link: 'https://www.youtube.com/watch?v=okakoro_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'PKMR',
        name: 'PekoMarin',
        members: ['UsadaPekora', 'HoshoMarin'],
        price: 100,
        change24h: 0,
        ceoTitle: 'PM董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'UsadaPekora 在 X 提及 HoshoMarin：「船長今天又在發病了peko...」', link: 'https://x.com/usadapekora/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'PekoMarin 【3D LIVE】三週年特別舞台聯動！', link: 'https://www.youtube.com/watch?v=pekomarin_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'SSWT',
        name: 'ShishiWata',
        members: ['ShishiroBotan', 'TsunomakiWatame'],
        price: 100,
        change24h: 0,
        ceoTitle: 'SW董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'ShishiroBotan 在 X 提及 TsunomakiWatame：「今天的羊肉爐材料準備好了（笑）」', link: 'https://x.com/shishirobotan/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'ShishiWata 【MONSTER HUNTER】狩獵聯動！', link: 'https://www.youtube.com/watch?v=shishiwata_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'SRAZ',
        name: 'SorAZ',
        members: ['TokinoSora', 'AZKi'],
        price: 100,
        change24h: 0,
        ceoTitle: 'SA董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'TokinoSora 在 X 提及 AZKi：「跟AZKi醬去喝下午茶了！」', link: 'https://x.com/tokino_sora/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'SorAZ 【3D LIVE】SorAZ 專屬 Live 表演！', link: 'https://www.youtube.com/watch?v=soraz_collab_live_placeholder', time: '05/23' }
        ]
    },
    {
        id: 'SBRN',
        name: 'SubaRuna',
        members: ['OozoraSubaru', 'HimemoriRuna'],
        price: 100,
        change24h: 0,
        ceoTitle: 'SR董事長',
        history: [],
        recentTrades: [],
        yesterdayPrice: 100,
        todayVolume: 0,
        status: 'NORMAL' as const,
        warningWeeks: 0,
        pendingInteractions: { liveCollab: 0, largeEvent: 0, newSong: 0 },
        teeteeNews: [
            { type: 'x_mention', content: 'OozoraSubaru 在 X 提及 HimemoriRuna：「公主殿下今天也是元氣滿滿的nora！」', link: 'https://x.com/oozorasubaru/status/1780000000000000000', time: '05/23' },
            { type: 'collab_live', content: 'SubaRuna 【Overcooked 2】廚房大混亂聯動！', link: 'https://www.youtube.com/watch?v=subaruna_collab_live_placeholder', time: '05/23' }
        ]
    }
].sort((a, b) => a.name.localeCompare(b.name));

