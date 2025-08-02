import {
  Tree,
  formatFiles,
  names,
  generateFiles,
  joinPathFragments,
} from '@nx/devkit';
import { NodeSchema } from './schema';

export default async function (tree: Tree, options: NodeSchema) {
  const normalizedOptions = normalizeOptions(options);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}

function normalizeOptions(options: NodeSchema): NormalizedNodeSchema {
  const name = names(options.name).fileName;
  const className = names(options.name).className;
  const constantName = names(options.name).constantName;
  
  const nodeDirectory = options.category 
    ? `libs/integrations/${options.category}-nodes`
    : 'libs/integrations/core-nodes';
  
  const nodePath = `${nodeDirectory}/${name}`;

  return {
    ...options,
    name,
    className,
    constantName,
    nodeDirectory,
    nodePath,
  };
}

function addFiles(tree: Tree, options: NormalizedNodeSchema) {
  const templateOptions = {
    ...options,
    template: '',
  };
  
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    options.nodePath,
    templateOptions
  );
}

interface NormalizedNodeSchema extends NodeSchema {
  className: string;
  constantName: string;
  nodeDirectory: string;
  nodePath: string;
}
