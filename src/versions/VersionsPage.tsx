// The versions page at the root of the published site: every branch of the prototype, with a
// link to each. Part of the deploy (scripts/pages-site.mjs writes the versions.json it reads);
// you don't need to edit it.
import { useEffect, useState } from 'react';
import moment from 'moment';
import {
  EuiBadge,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiInMemoryTable,
  EuiLink,
  EuiPageTemplate,
  EuiSkeletonTitle,
  EuiText,
  EuiToolTip,
  useEuiTheme,
} from '@elastic/eui';
import type { EuiBasicTableColumn } from '@elastic/eui';

interface Version {
  branch: string;
  /** Folder of the version on the site, like main or branches/empty-states. */
  path: string;
  updated?: string;
  author?: string;
  sha?: string;
}

interface VersionsFile {
  title: string;
  /** owner/name on GitHub. */
  repository?: string;
  defaultBranch: string;
  versions: Version[];
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; file: VersionsFile };

const versionUrl = (path: string) => `./${path.split('/').map(encodeURIComponent).join('/')}/`;

export function VersionsPage() {
  const { euiTheme } = useEuiTheme();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    fetch('./versions.json', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((file: VersionsFile) => {
        document.title = `${file.title} versions`;
        setState({ status: 'ready', file });
      })
      .catch(() => setState({ status: 'error' }));
  }, []);

  if (state.status === 'error') {
    return (
      <EuiPageTemplate>
        <EuiPageTemplate.EmptyPrompt
          iconType="branch"
          title={<h1>No versions yet</h1>}
          body={<p>Push a branch to publish the first version of this prototype.</p>}
        />
      </EuiPageTemplate>
    );
  }

  const file = state.status === 'ready' ? state.file : undefined;
  const repoUrl = file?.repository ? `https://github.com/${file.repository}` : undefined;
  // The default branch first, then the most recently updated.
  const versions = [...(file?.versions ?? [])].sort((a, b) =>
    a.branch === file?.defaultBranch ? -1 : b.branch === file?.defaultBranch ? 1 : (b.updated ?? '').localeCompare(a.updated ?? ''),
  );

  const columns: Array<EuiBasicTableColumn<Version>> = [
    {
      field: 'branch',
      name: 'Version',
      render: (branch: string, version: Version) => (
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false} wrap>
          <EuiLink href={versionUrl(version.path)}>{branch}</EuiLink>
          {branch === file?.defaultBranch && <EuiBadge color="hollow">Default</EuiBadge>}
        </EuiFlexGroup>
      ),
    },
    {
      field: 'updated',
      name: 'Last updated',
      width: '20%',
      render: (updated?: string) =>
        updated ? (
          <EuiToolTip content={moment(updated).format('LLL')}>
            <EuiText size="s" tabIndex={0}>
              {moment(updated).fromNow()}
            </EuiText>
          </EuiToolTip>
        ) : null,
    },
    { field: 'author', name: 'Updated by', width: '25%' },
    ...(repoUrl
      ? [
          {
            name: 'Code',
            width: euiTheme.size.xxxxl,
            align: 'right' as const,
            render: (version: Version) => (
              <EuiToolTip content="View the code on GitHub">
                <EuiButtonIcon
                  iconType="logoGithub"
                  aria-label={`View the code of ${version.branch} on GitHub`}
                  href={`${repoUrl}/tree/${version.branch}`}
                  target="_blank"
                />
              </EuiToolTip>
            ),
          },
        ]
      : []),
  ];

  return (
    <EuiPageTemplate panelled restrictWidth={1000}>
      <EuiPageTemplate.Header
        pageTitle={file?.title ?? <EuiSkeletonTitle size="l" />}
        description="Every branch of this prototype, published. Push to a branch to update its version; delete the branch to remove it."
        rightSideItems={
          repoUrl
            ? [
                <EuiButtonEmpty key="repo" iconType="logoGithub" href={repoUrl} target="_blank">
                  Repository
                </EuiButtonEmpty>,
              ]
            : []
        }
      />
      <EuiPageTemplate.Section>
        <EuiInMemoryTable
          tableCaption="Versions of this prototype"
          items={versions}
          columns={columns}
          loading={state.status === 'loading'}
          search={versions.length > 6 ? { box: { incremental: true, placeholder: 'Search versions' } } : undefined}
          noItemsMessage={state.status === 'loading' ? 'Loading versions' : 'No versions yet'}
        />
      </EuiPageTemplate.Section>
    </EuiPageTemplate>
  );
}
