import { Suspense } from "react";
import { PageWrapper } from "components/styles";
import { WaterfallGrid } from "./WaterfallGrid";

const Waterfall: React.FC = () => (
  <PageWrapper>
    <h1>Waterfall</h1>
    <Suspense fallback={<h3>Loading waterfall...</h3>}>
      <WaterfallGrid />
    </Suspense>
  </PageWrapper>
);

export default Waterfall;
