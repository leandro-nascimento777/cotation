import { getPublicProposalByToken } from "@/lib/proposal/actions";
import { ProposalPage } from "@/components/proposal/ProposalPage";
import { ProposalUnavailable } from "@/components/proposal/ProposalUnavailable";

export default async function TemporaryProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getPublicProposalByToken(token);

  if (!result.ok) return <ProposalUnavailable reason={result.reason} />;
  return <ProposalPage share={result.share} />;
}
