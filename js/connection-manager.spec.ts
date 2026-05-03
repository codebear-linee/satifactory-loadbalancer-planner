import { beforeEach, describe, expect, it } from 'vitest';
import { ConnectionManager } from './connection-manager';
import { InputPort, OutputPort } from './logical-elements';

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;

  beforeEach(() => {
    connectionManager = new ConnectionManager();
  });

  describe('adding a new connection', () => {
    it('fails, if source port already is connected and new target port is different from existing target port', () => {
      const sourcePort = new OutputPort('parent-1');
      const targetPort1 = new InputPort('parent-2');
      const targetPort2 = new InputPort('parent-2');

      connectionManager.addConnection(sourcePort, targetPort1);

      expect(() => {
        connectionManager.addConnection(sourcePort, targetPort2);
      }).toThrow(
        `Can not connect a port twice: {"foundConnection":{"source":{"id":"${sourcePort.id}","parentId":"parent-1"},"target":{"port":{"id":"${targetPort1.id}","parentId":"parent-2"},"weight":0}},"requestedConnection":{"source":{"id":"${sourcePort.id}","parentId":"parent-1"},"target":{"id":"${targetPort2.id}","parentId":"parent-2"}}}`,
      );
    });
  });

  describe('getting a connected port', () => {
    it('returns null, when port is not connected', () => {
      const sourcePort = new OutputPort('parent-1');
      const targetPort1 = new InputPort('parent-2');
      const targetPort2 = new InputPort('parent-2');

      connectionManager.addConnection(sourcePort, targetPort1);

      expect(connectionManager.getConnectedPort(targetPort2)).toBeNull();
    });
  });

  describe('removing a connection', () => {
    it('fails, if source port has no connection', () => {
      const sourcePort1 = new OutputPort('parent-1');
      const sourcePort2 = new OutputPort('parent-1');
      const targetPort = new InputPort('parent-2');

      connectionManager.addConnection(sourcePort1, targetPort);

      expect(() => {
        connectionManager.removeConnection(sourcePort2, targetPort);
      }).toThrow(
        `Connection not found: {"sourcePort":{"id":"${sourcePort2.id}","parentId":"parent-1"},"targetPort":{"id":"${targetPort.id}","parentId":"parent-2"}}`,
      );
    });
    it('fails, if source port and target port are not connected', () => {
      const sourcePort1 = new OutputPort('parent-1');
      const sourcePort2 = new OutputPort('parent-1');
      const targetPort1 = new InputPort('parent-2');
      const targetPort2 = new InputPort('parent-2');

      connectionManager.addConnection(sourcePort1, targetPort1);
      connectionManager.addConnection(sourcePort2, targetPort2);

      expect(() => {
        connectionManager.removeConnection(sourcePort1, targetPort2);
      }).toThrow(
        `Connection not found: {"sourcePort":{"id":"${sourcePort1.id}","parentId":"parent-1"},"targetPort":{"id":"${targetPort2.id}","parentId":"parent-2"}}`,
      );
    });
  });
});
