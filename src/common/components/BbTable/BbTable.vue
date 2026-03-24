<template>
  <div class="bb-table-container" :class="{
    border: border,
    small: size === 'small',
    large: size === 'large',
  }">
    <table class="bb-table" @click="onTableClick">
      <thead>
        <tr>
          <th v-for="(
{ prop, title, formatter, thProps, ...otherProps }, index
            ) in columns" :key="prop" v-bind="{ ...otherProps, ...(thProps || {}) }" v-html="title" align="center">
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="autoSummary" class="bold">
          <template v-for="(
{ prop, formatter, tdProps, onClick, needSummary, ...otherProps },
                cIndex
            ) in columns" :key="prop">
            <td align="center" :colspan="cIndex === 0 ? autoSummary : 1" v-if="cIndex === 0 || cIndex >= autoSummary">
              {{ cIndex === 0 ? '总计' : needSummary ? getSummary(dataList.flat(Infinity), prop) : "" }}
            </td>
          </template>
        </tr>
        <template v-for="(item, index) in dataList">
          <tr :class="`group-${index % 2 === 0 ? 'even' : 'odd'}`" v-if="!Array.isArray(item)" :key="index">
            <td v-for="(
{ prop, formatter, tdProps, onClick, ...otherProps }, index
              ) in columns" :key="prop" align="center" @click="onClick?.(item[prop], item, index)">
              <span v-bind="{ ...otherProps, ...(tdProps || {}) }" v-html="formatter ? formatter(item[prop], item, index) : item[prop]
                "></span>
            </td>
          </tr>
          <tr v-else v-for="(cTr, cIndex) in item" :key="`${index}-${cIndex}`"
            :class="`group-${index % 2 === 0 ? 'even' : 'odd'}`">
            <template v-for="(
{ prop, formatter, tdProps, onClick, rowSpan, ...otherProps },
                  index
              ) in columns" :key="prop">
              <td align="center" @click="onClick?.(cTr[prop], cTr, index)"
                :rowspan="rowSpan && cIndex === 0 ? item.length : 1" v-if="!rowSpan || cIndex === 0">
                <span v-bind="{ ...otherProps, ...(tdProps || {}) }" v-html="formatter ? formatter(cTr[prop], cTr, index) : cTr[prop]
                  "></span>
              </td>
            </template>
          </tr>
          <tr v-if="autoSummary" :class="`group-${index % 2 === 0 ? 'even' : 'odd'}`">
            <template v-for="(
{
                  prop,
                  formatter,
                  needSummary,
                  tdProps,
                  onClick,
                  rowSpan,
                  ...otherProps
                },
                  cIndex
              ) in columns" :key="prop">
              <td align="center" :colspan="cIndex === 0 ? autoSummary : 1" v-if="cIndex === 0 || cIndex >= autoSummary">
                <span v-bind="{ ...otherProps }">
                  {{ cIndex === 0 ? '合计' : needSummary ? getSummary(item, prop) : '' }}
                </span>
              </td>
            </template>
          </tr>
        </template>
        <!-- <tr v-for="(item, index) in dataList" :key="index">
        <td v-for="({prop, formatter, tdProps, onClick, ...otherProps}, index) in columns" :key="prop"  align="center" @click="onClick?.(item[prop], item, index)">
          <span v-bind="{...otherProps, ...(tdProps || {})}" v-html="formatter ? formatter(item[prop], item, index) : item[prop]"></span>
        </td>
      </tr> -->
      </tbody>
    </table>
  </div>
</template>
<script setup name="BbTable">
import Decimal from "decimal.js";
const props = defineProps({
  dataList: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  border: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: "small",
  },
  autoSummary: {
    type: Number || String,
  },
});
function onTableClick() {
  console.log(props.dataList)
}
function getSummary(item, prop) {
  // console.log(item, prop);
  const list = Array.isArray(item) ? item : [item];
  return list.reduce((pre, cur) => {
    return new Decimal(pre).plus(new Decimal(cur[prop])).toNumber();
  }, 0);
}
</script>
<style lang="less" scoped>
.bb-table-container {
  width: 100%;
  background-color: #ffffff;

  //overflow: hidden;
  .bb-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0px;

    //position: relative;
    thead {
      tr {
        background-color: #f1f1f6;
        //position: sticky;
        //top: -1px;
      }
    }

    tr {
      &:nth-child(even) {
        background-color: #F5F5F5;
      }

      th,
      td {
        padding: 4px 2px;
      }

      th {
        font-size: 15px;
        color: #0e0e0e;
        font-weight: bold;
      }

      td {
        font-size: 15px;
        color: #383838;
      }

      &.bold {

        th,
        td {
          font-weight: bold;
        }
      }
    }
  }

  &.border {
    .bb-table {

      //border: 1px solid @border-color;
      tr {
        &:last-child:not(:nth-child(even)) {
          td {
            border-bottom: @border-width solid #eeeeee;
          }
        }
        &:nth-child(even) {
          background-color: #F5F5F5;
          td {
            border-right: @border-width solid #ffffff;
          }
        }

        td {
          border-right: @border-width solid #eeeeee;

          // border-bottom: @border-width solid #eeeeee;
          &:last-child {
            border-right: none;
          }
        }

        th {
          border-right: 1px solid #ffffff;
        }
      }
    }
  }

  &.large {
    .bb-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0px;

      //position: relative;
      thead {
        tr {
          background-color: #efefef;
          //position: sticky;
          //top: -1px;
        }
      }

      tr {

        th,
        td {
          padding: 10px 8px;
        }

        th {
          font-size: @font-size-md;
          color: @font-normal-color;
        }

        td {
          font-size: @font-size-md;
          color: @font-normal-color;
        }
      }
    }
  }
}
</style>
