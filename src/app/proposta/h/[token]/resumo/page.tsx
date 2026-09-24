import { getPublicProposalByToken } from "@/lib/proposal/actions";
import { ProposalAgentSummary } from "@/components/proposal/ProposalAgentSummary";
import { ProposalUnavailable } from "@/components/proposal/ProposalUnavailable";

export default async function TemporaryProposalSummaryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getPublicProposalByToken(token);

  if (!result.ok) return <ProposalUnavailable reason={result.reason} />;
  return <ProposalAgentSummary share={result.share} />;
}
