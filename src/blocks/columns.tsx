import { Children, Fragment, type ReactElement, type ReactNode } from 'react';
import { Outlook } from '../components';
import { GhostTable } from './ghost-table';

export type ColumnProps = {
  width: number;
  children: ReactNode;
};

export type ColumnsProps = {
  children: ReactElement<ColumnProps> | ReactElement<ColumnProps>[];
  gap?: number;
};

export function Column({ children }: ColumnProps) {
  return <>{children}</>;
}

export function Columns({ children, gap = 0 }: ColumnsProps) {
  const columns = Children.toArray(children) as ReactElement<ColumnProps>[];

  return (
    <GhostTable
      wrapper={(slot) => (
        <table
          role="presentation"
          cellSpacing={0}
          cellPadding={0}
          border={0}
          width="100%"
        >
          <tbody>
            <tr>{slot}</tr>
          </tbody>
        </table>
      )}
    >
      {columns.map((col, i) => {
        const { width, children: colChildren } = col.props;
        const isLast = i === columns.length - 1;

        return (
          <Fragment key={i}>
            <GhostTable
              wrapper={(slot) => (
                <td width={width} valign="top">
                  {slot}
                </td>
              )}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: '100%',
                  maxWidth: width,
                  verticalAlign: 'top',
                }}
              >
                {colChildren}
              </div>
            </GhostTable>

            {!isLast && gap > 0 && (
              <>
                <mso-expr
                  data-expr="mso"
                  dangerouslySetInnerHTML={{
                    __html: `<td width="${gap}">&nbsp;</td>`,
                  }}
                />
                <Outlook not>
                  <div style={{ display: 'inline-block', width: gap }}>
                    &nbsp;
                  </div>
                </Outlook>
              </>
            )}
          </Fragment>
        );
      })}
    </GhostTable>
  );
}
