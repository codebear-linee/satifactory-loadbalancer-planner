import { OutputPort } from './logical-elements';
import { Port } from './models';

type GraphData = Map<Port, TargetNode>;

type TargetNode = {
  port: Port;
  weight: number;
};

type Connection = {
  sourcePort: Port;
  targetPort: Port;
};

export class ConnectionManager {
  private adjacencyList: GraphData = new Map();
  private nodesInGraph = new Set<Port>();

  public getConnections(): Array<Connection> {
    const connections: Array<Connection> = [];
    this.adjacencyList.forEach((targetNode, sourcePort) => {
      connections.push({ sourcePort, targetPort: targetNode.port });
    });

    return connections;
  }

  public addConnection(sourcePort: Port, targetPort: Port) {
    if (
      this.adjacencyList.has(sourcePort) &&
      targetPort !== this.adjacencyList.get(sourcePort)?.port
    ) {
      const foundConnection = {
        source: sourcePort,
        target: this.adjacencyList.get(sourcePort),
      };

      const requestedConnection = {
        source: sourcePort,
        target: targetPort,
      };

      throw new Error(
        `Can not connect a port twice: ${JSON.stringify({
          foundConnection,
          requestedConnection,
        })}`,
      );
    } else {
      this.adjacencyList.set(sourcePort, { port: targetPort, weight: 0 });
    }

    this.nodesInGraph.add(sourcePort);
    this.nodesInGraph.add(targetPort);
  }

  public hasConnection(port: Port): boolean {
    return this.nodesInGraph.has(port);
  }

  public getConnectedPort(port: Port): Port | null {
    if (port instanceof OutputPort) {
      if (this.adjacencyList.has(port)) {
        return this.adjacencyList.get(port)!.port;
      }
    } else {
      for (const [sourcePort, targetNode] of this.adjacencyList.entries()) {
        if (targetNode.port === port) {
          return sourcePort;
        }
      }
    }

    return null;
  }

  public removeConnection(sourcePort: Port, targetPort: Port) {
    if (
      !this.adjacencyList.has(sourcePort) ||
      targetPort !== this.adjacencyList.get(sourcePort)?.port
    ) {
      throw new Error(
        `Connection not found: ${JSON.stringify({ sourcePort, targetPort })}`,
      );
    }

    this.adjacencyList.delete(sourcePort);
    this.nodesInGraph.delete(sourcePort);
    this.nodesInGraph.delete(targetPort);
  }
}
