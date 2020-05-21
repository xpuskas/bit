/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Box, Text } from 'ink';
import { Insight, InsightResult, RawResult } from '../insight';
import { GraphBuilder } from '../../graph';

export const INSIGHT_NAME = 'totals';

export default class Totals implements Insight {
  name = INSIGHT_NAME;
  description = 'totals in the graph';
  graphBuilder: GraphBuilder;
  constructor(graphBuilder: GraphBuilder) {
    this.graphBuilder = graphBuilder;
  }
  async _runInsight(): Promise<RawResult> {
    const graph = await this.graphBuilder.getGraph();
    if (!graph) {
      return {
        message: '',
        data: undefined
      };
    }
    return {
      message: '',
      data: graph.totals()
    };
  }

  _renderData(data: any) {
    if (data.data.length === 0) {
      return (
        <div>
          <Text>Could not get totals</Text>
        </div>
      );
    }
    return (
      <div>
        <Text>{'\n'}</Text>
        <Text>`Total components: ${data.data.components}</Text>
        <Text>`Total dependencies: ${data.data.dependencies}</Text>
        <Text>`Total dependents: ${data.data.dependents}</Text>
      </div>
    );
  }

  async run(): Promise<InsightResult> {
    const bareResult = await this._runInsight();
    const renderedData = this._renderData(bareResult);
    const result: InsightResult = {
      metaData: {
        name: this.name,
        description: this.description
      },
      data: bareResult.data,
      renderedData
    };

    if (bareResult.message) {
      result.message = bareResult.message;
    }
    return result;
  }
}
