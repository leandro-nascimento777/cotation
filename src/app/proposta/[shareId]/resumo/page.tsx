import { getPublicProposal } from "@/lib/proposal/actions";
import { ProposalAgentSummary } from "@/components/proposal/ProposalAgentSummary";
import { ProposalUnavailable } from "@/components/proposal/ProposalUnavailable";

export default async function PermanentProposalSummaryPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const result = await getPublicProposal(shareId);

  if (!result.ok) return <ProposalUnavailable reason={result.reason} />;
  return <ProposalAgentSummary share={result.share} />;
}
