import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { PageWrapper } from "components/styles";
import { slugs } from "constants/routes";
import { WaterfallGrid } from "./WaterfallGrid";

const Waterfall: React.FC = () => {
  const { [slugs.projectIdentifier]: projectIdentifier } = useParams<{
    [slugs.projectIdentifier]: string;
  }>();

  return (
    <PageWrapper data-cy="waterfall-page">
      <h1>Waterfall Page for {projectIdentifier}</h1>
      <Suspense fallback={<h3>Loading waterfall...</h3>}>
        <WaterfallGrid />
      </Suspense>
    </PageWrapper>
  );
};

export default Waterfall;
