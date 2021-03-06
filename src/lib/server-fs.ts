/* eslint-disable functional/prefer-readonly-type */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-return-void */
import { resolve } from 'path';

import chokidar from 'chokidar';
import fs from 'fs-extra';
import glob from 'glob';

/**
 * TODO
 */
export type UseServerFs = {
  loadFromDisk: (rootDir?: string) => ServerFs;
};

/**
 * TODO
 */
export type ServerFsWatchEvent = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * TODO
 */
export type ServerFsWatchAction = {
  readonly file: string;
  readonly event: ServerFsWatchEvent;
  readonly stats?: fs.Stats;
};

/**
 * TODO
 */
export type ServerFsWatchAborter = () => void;

/**
 * TODO
 */
export type ServerFsWatchCallback = (action: ServerFsWatchAction) => void;
export type ServerFsSearchCallback = (files: string[]) => void;

/**
 * Describes the behavior and features of a filesystem.
 */
export type ServerFs = {
  readonly exists: (path: string) => boolean;
  readonly read: (path: string) => Buffer;
  readonly write: (path: string, contents: string | Buffer) => void;
  readonly list: (path: string) => readonly string[];
  readonly search: (pattern: string, callback: ServerFsSearchCallback) => void;
  readonly watch: (
    paths: readonly string[],
    callback: ServerFsWatchCallback
  ) => ServerFsWatchAborter;
};

/**
 *
 * @returns
 */
export function useServerFs(): UseServerFs {
  /**
   * Bootstrap a Minecraft server filesystem by loading a directory from disk.
   *
   * @param rootDir The directory that contains your server.properties file
   * @returns
   */
  function loadFromDisk(rootDir?: string): ServerFs {
    const serverDir = rootDir || '.';

    const exists = (path: string) => fs.existsSync(resolve(serverDir, path));
    const read = (path: string) => fs.readFileSync(resolve(serverDir, path));
    const write = (path: string, contents: Buffer | string) =>
      fs.writeFileSync(resolve(serverDir, path), contents);
    const list = (path: string) => fs.readdirSync(resolve(serverDir, path));

    /**
     * TODO
     *
     * @param pattern
     * @param callback
     */
    function search(pattern: string, callback: ServerFsSearchCallback): void {
      const handler = (err: Error | null, matches: string[]) => {
        let results: string[] = [];

        if (!err) {
          results = matches;
        }

        return callback(results);
      };

      glob(pattern, handler);
    }

    /**
     * TODO
     *
     * @param paths
     * @param callback
     * @returns
     */
    function watch(paths: readonly string[], callback: ServerFsWatchCallback) {
      const watcher = chokidar.watch(paths, {});

      watcher
        .on('add', (path: string, stats?: fs.Stats) =>
          callback({ file: path, event: 'CREATE', stats })
        )
        .on('change', (path: string, stats?: fs.Stats) =>
          callback({ file: path, event: 'UPDATE', stats })
        )
        .on('unlink', (path: string, stats?: fs.Stats) =>
          callback({ file: path, event: 'DELETE', stats })
        );

      return () => watcher.close();
    }

    return { exists, read, write, list, search, watch };
  }

  return { loadFromDisk };
}

export default useServerFs;
