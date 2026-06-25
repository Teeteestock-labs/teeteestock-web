import { notFound } from "next/navigation";
import MarketDetailClient from "./MarketDetailClient";

const GOLDEN_IDS = ['MCMT', 'OKKR', 'PKMR', 'NEFL', 'SRAZ', 'FBMO', 'SSWT', 'SBRN', 'AZIR'];

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function MarketDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const upperId = resolvedParams.id.toUpperCase();

    if (!GOLDEN_IDS.includes(upperId)) {
        notFound();
    }

    return <MarketDetailClient id={upperId} />;
}