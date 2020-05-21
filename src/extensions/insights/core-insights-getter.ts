import { GraphBuilder } from '../graph';
import FindCycles from './all-insights/find-cycles';
import DuplicateDependencies from './all-insights/duplicate-dependencies';
import Totals from './all-insights/totals';

export default function getCoreInsights(graphBuilder: GraphBuilder) {
  const coreInsights = [
    new Totals(graphBuilder),
    new FindCycles(graphBuilder),
    new DuplicateDependencies(graphBuilder)
  ];
  return coreInsights;
}
