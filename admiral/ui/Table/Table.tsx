import React, { forwardRef, useMemo } from 'react'
import cn from 'classnames'
import RcTable, { Summary } from 'rc-table'
import { TableProps as RcTableProps, INTERNAL_HOOKS } from 'rc-table/lib/Table'
import { convertChildrenToColumns } from 'rc-table/lib/hooks/useColumns'
import styles from './Table.module.scss'
import { ColumnsType, ColumnType } from './interfaces'
import useSorter, { SorterResult, SortState, SortOrder, getSortData } from './hooks/useSorter'

// TODO: loading spinner
// TODO: pagination
// TODO: controlled sorter
// TODO: sorter tooltip

export type SizeType = 'small' | 'middle' | 'large'

export interface ChangeEventInfo<RecordType> {
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[]
    sorterStates: SortState<RecordType>[]
}

export interface TableProps<RecordType>
    extends Omit<
        RcTableProps<RecordType>,
        | 'transformColumns'
        | 'internalHooks'
        | 'internalRefs'
        | 'data'
        | 'columns'
        // | 'scroll'
        | 'emptyText'
    > {
    // dropdownPrefixCls?: string;
    dataSource?: RcTableProps<RecordType>['data']
    columns?: ColumnsType<RecordType>
    // pagination?: false | TablePaginationConfig;
    // loading?: boolean | SpinProps;
    size?: SizeType
    bordered?: boolean
    onChange?: (sorter: SorterResult<RecordType> | SorterResult<RecordType>[]) => void
    // rowSelection?: TableRowSelection<RecordType>;

    // getPopupContainer?: GetPopupContainer;
    // scroll?: RcTableProps<RecordType>['scroll'] & {
    //   scrollToFirstRowOnChange?: boolean;
    // };
    sortDirections?: SortOrder[]
    // showSorterTooltip?: boolean | TooltipProps;
}

const EMPTY_LIST: any[] = []

function Column<RecordType>(_: ColumnType<RecordType>) {
    return null
}

function InternalTable<RecordType extends object = any>(
    props: TableProps<RecordType>,
    wrapperRef: React.ForwardedRef<HTMLDivElement>,
) {
    const {
        className: wrapperClassName,
        style,
        dataSource,
        columns,
        size = 'large',
        bordered = false,
        sortDirections,
        onChange,
        children,
        ...tableProps
    } = props

    const data: readonly RecordType[] = dataSource || EMPTY_LIST

    // >>>>>>>>> Spinning
    // let spinProps: SpinProps | undefined;
    // if (typeof loading === 'boolean') {
    //   spinProps = {
    //     spinning: loading,
    //   };
    // } else if (typeof loading === 'object') {
    //   spinProps = {
    //     spinning: true,
    //     ...loading,
    //   };
    // }
    // To merge columns used as children (<Table.Column />)
    const mergedColumns = useMemo(() => {
        return columns || (convertChildrenToColumns(children) as ColumnsType<RecordType>)
    }, [children, columns])

    const changeEventInfo: Partial<ChangeEventInfo<RecordType>> = {}

    const _onChange = (info: Partial<ChangeEventInfo<RecordType>>) => {
        const changeInfo = {
            ...changeEventInfo,
            ...info,
        }

        if (onChange) {
            onChange(changeInfo.sorter!)
        }
    }

    const onSorterChange = (
        sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
        sorterStates: SortState<RecordType>[],
    ) => {
        _onChange({
            sorter,
            sorterStates,
        })
    }

    const [transformSorterColumns, sortStates, sorterTitleProps, getSorters] =
        useSorter<RecordType>({
            mergedColumns,
            onSorterChange,
            sortDirections: sortDirections || ['ascend', 'descend'],
        })
    const sortedData = React.useMemo(() => getSortData(data, sortStates), [data, sortStates])

    changeEventInfo.sorter = getSorters()
    changeEventInfo.sorterStates = sortStates
    const transformedColumns = transformSorterColumns(mergedColumns)

    return (
        <div
            ref={wrapperRef}
            className={cn(styles.wrapper, wrapperClassName, {
                [styles.wrapper__SizeMiddle]: size === 'middle',
                [styles.wrapper__SizeSmall]: size === 'small',
                [styles.wrapper__Bordered]: bordered,
            })}
            style={style}
        >
            {/* <Spin spinning={false} {...spinProps}> */}
            <RcTable<RecordType>
                {...tableProps}
                prefixCls="admiral-table"
                columns={transformedColumns}
                data={sortedData}
                // direction={direction}
                // expandable={mergedExpandable}
                // className={classNames({
                //   [`${prefixCls}-middle`]: mergedSize === 'middle',
                //   [`${prefixCls}-small`]: mergedSize === 'small',
                //   [`${prefixCls}-bordered`]: bordered,
                //   [`${prefixCls}-empty`]: rawData.length === 0,
                // })}
                // rowKey={getRowKey}
                // rowClassName={internalRowClassName}
                // emptyText={(locale && locale.emptyText) || renderEmpty('Table')}
                // // Internal
                // internalHooks={INTERNAL_HOOKS}
                // internalRefs={internalRefs as any}
                // transformColumns={transformColumns}
            />
            {/* {bottomPaginationNode} */}
            {/* </Spin> */}
        </div>
    )
}

const ForwardTable = forwardRef(InternalTable) as <T>(
    props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof InternalTable>

type ForwardTableType = typeof ForwardTable
interface TableInterface extends ForwardTableType {
    Column: typeof Column
}

export const Table = ForwardTable as TableInterface
Table.Column = Column
