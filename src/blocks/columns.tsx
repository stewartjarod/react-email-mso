import { Children, type ReactElement, type ReactNode } from 'react';
import { Outlook } from '../components';

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
    <>
      <Outlook>
        <div
          dangerouslySetInnerHTML={{
            __html: '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tr>',
          }}
        />
      </Outlook>

      {columns.map((col, i) => {
        const { width, children: colChildren } = col.props;
        const isLast = i === columns.length - 1;

        return (
          <span key={i}>
            <Outlook>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<td width="${width}" valign="top">`,
                }}
              />
            </Outlook>

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

            <Outlook>
              <div
                dangerouslySetInnerHTML={{
                  __html: isLast
                    ? '</td>'
                    : `</td>${gap > 0 ? `<td width="${gap}">&nbsp;</td>` : ''}`,
                }}
              />
            </Outlook>

            {!isLast && gap > 0 && (
              <Outlook expr="!mso">
                <div style={{ display: 'inline-block', width: gap }}>&nbsp;</div>
              </Outlook>
            )}
          </span>
        );
      })}

      <Outlook>
        <div dangerouslySetInnerHTML={{ __html: '</tr></table>' }} />
      </Outlook>
    </>
  );
}
