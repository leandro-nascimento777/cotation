import { getPublicProposal } from "@/lib/proposal/actions";
import { ProposalPage } from "@/components/proposal/ProposalPage";
import { ProposalUnavailable } from "@/components/proposal/ProposalUnavailable";

export default async function PermanentProposalPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const result = await getPublicProposal(shareId);

  if (!result.ok) return <ProposalUnavailable reason={result.reason} />;
  return <ProposalPage share={result.share} />;
}
